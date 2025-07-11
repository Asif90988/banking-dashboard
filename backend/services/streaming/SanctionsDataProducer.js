// SanctionsDataProducer.js
const { Producer } = require('kafkajs');
const { Kafka } = require('kafkajs');
const axios = require('axios');
const logger = require('../../utils/logger'); // Assuming a logger utility exists

class SanctionsDataProducer {
  constructor(config) {
    this.config = {
      kafka: {
        clientId: 'sanctions-producer',
        brokers: ['localhost:9092'], // Default, can be overridden
        ...config.kafka
      },
      api: {
        key: process.env.OPENSANCTIONS_API_KEY || '',
        url: 'https://api.opensanctions.org/search/sanctions',
        query: 'topics:sanction',
        schema: 'Person',
        limit: 100,
        ...config.api
      },
      topic: config.topic || 'sanctions-data',
      pollInterval: config.pollInterval || 3600000, // Default to hourly polling (in milliseconds)
    };
    this.producer = null;
    this.isRunning = false;
  }

  async initialize() {
    try {
      const kafka = new Kafka(this.config.kafka);
      this.producer = kafka.producer();
      await this.producer.connect();
      logger.info('SanctionsDataProducer initialized and connected to Kafka');
      return true;
    } catch (error) {
      logger.error('Failed to initialize SanctionsDataProducer:', error);
      return false;
    }
  }

  async pollSanctionsData() {
    try {
      const { url, query, schema, limit, key } = this.config.api;
      const response = await axios.get(url, {
        params: { q: query, schema, limit },
        headers: key ? { 'Authorization': `ApiKey ${key}` } : {}
      });

      if (response.status === 200 && response.data.results) {
        const results = response.data.results;
        logger.info(`Fetched ${results.length} sanctions entries from OpenSanctions API`);
        return results;
      } else {
        logger.warn('No data or unexpected response from OpenSanctions API');
        return [];
      }
    } catch (error) {
      logger.error('Error fetching data from OpenSanctions API:', error.message);
      return [];
    }
  }

  async produceData(data) {
    if (!this.producer) {
      logger.error('Producer not initialized');
      return false;
    }

    try {
      for (const entry of data) {
        await this.producer.send({
          topic: this.config.topic,
          messages: [
            { value: JSON.stringify(entry) }
          ],
        });
      }
      logger.info(`Produced ${data.length} sanctions entries to topic ${this.config.topic}`);
      return true;
    } catch (error) {
      logger.error('Error producing data to Kafka:', error);
      return false;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn('SanctionsDataProducer is already running');
      return;
    }

    if (!this.producer) {
      const initialized = await this.initialize();
      if (!initialized) {
        logger.error('Failed to start SanctionsDataProducer due to initialization failure');
        return;
      }
    }

    this.isRunning = true;
    logger.info('Starting SanctionsDataProducer polling loop');

    const pollLoop = async () => {
      while (this.isRunning) {
        try {
          const data = await this.pollSanctionsData();
          if (data.length > 0) {
            await this.produceData(data);
          }
          await new Promise(resolve => setTimeout(resolve, this.config.pollInterval));
        } catch (error) {
          logger.error('Error in polling loop:', error);
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute on error
        }
      }
    };

    pollLoop().catch(error => {
      logger.error('Fatal error in SanctionsDataProducer:', error);
      this.isRunning = false;
    });
  }

  async stop() {
    this.isRunning = false;
    if (this.producer) {
      await this.producer.disconnect();
      logger.info('SanctionsDataProducer disconnected from Kafka');
    }
  }
}

module.exports = SanctionsDataProducer;
