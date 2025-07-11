const { Kafka, Consumer } = require('kafkajs');
const stringSimilarity = require('string-similarity'); // For fuzzy name matching
const logger = require('../../utils/logger'); // Assuming a logger utility exists

class SanctionsMatcher {
  constructor(config, kafkaStreamingService) {
    this.config = {
      kafka: {
        clientId: 'sanctions-matcher',
        brokers: ['localhost:9092'], // Default, can be overridden
        groupId: 'sanctions-matcher-group',
        ...config.kafka
      },
      topics: {
        transactions: config.topics?.transactions || 'transaction-stream',
        sanctions: config.topics?.sanctions || 'sanctions-data',
        flagged: config.topics?.flagged || 'flagged-transactions'
      },
      matchThreshold: config.matchThreshold || 90, // Fuzzy matching confidence threshold
      ...config
    };
    this.kafkaStreamingService = kafkaStreamingService; // Reference to access stored sanctions data
    this.consumer = null;
    this.producer = null;
    this.isRunning = false;
  }

  async initialize() {
    try {
      const kafka = new Kafka(this.config.kafka);
      this.consumer = kafka.consumer({ groupId: this.config.kafka.groupId });
      this.producer = kafka.producer();
      
      await this.consumer.connect();
      await this.producer.connect();
      logger.info('SanctionsMatcher initialized and connected to Kafka');
      
      // Subscribe to transactions topic
      await this.consumer.subscribe({
        topic: this.config.topics.transactions,
        fromBeginning: false
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize SanctionsMatcher:', error);
      return false;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn('SanctionsMatcher is already running');
      return;
    }

    if (!this.consumer || !this.producer) {
      const initialized = await this.initialize();
      if (!initialized) {
        logger.error('Failed to start SanctionsMatcher due to initialization failure');
        return;
      }
    }

    this.isRunning = true;
    logger.info('Starting SanctionsMatcher processing loop');

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const transaction = JSON.parse(message.value.toString());
          logger.info(`Processing transaction: ${transaction.id}`);
          await this.checkTransactionAgainstSanctions(transaction);
        } catch (error) {
          logger.error('Error processing transaction:', error);
        }
      }
    });
  }

  async checkTransactionAgainstSanctions(transaction) {
    // Get sanctions data from KafkaStreamingService's store
    const sanctionsData = this.kafkaStreamingService.getSanctionsData();
    if (!sanctionsData || sanctionsData.length === 0) {
      logger.warn('No sanctions data available for matching');
      return;
    }

    const customerName = transaction.customerName || transaction.entityName || '';
    if (!customerName) {
      logger.warn(`Transaction ${transaction.id} has no customer or entity name to match`);
      return;
    }

    let highestMatch = { score: 0, entity: null };
    for (const entity of sanctionsData) {
      if (entity.name) {
        const score = stringSimilarity.compareTwoStrings(customerName.toLowerCase(), entity.name.toLowerCase()) * 100;
        if (score > highestMatch.score && score >= this.config.matchThreshold) {
          highestMatch = { score, entity };
        }
      }
    }

    if (highestMatch.score >= this.config.matchThreshold) {
      logger.info(`Sanctions match found for transaction ${transaction.id}: ${highestMatch.entity.name} (Score: ${highestMatch.score})`);
      await this.flagTransaction(transaction, highestMatch.entity, highestMatch.score);
    } else {
      logger.info(`No sanctions match for transaction ${transaction.id}`);
    }
  }

  async flagTransaction(transaction, matchedEntity, matchScore) {
    if (!this.producer) {
      logger.error('Producer not initialized for flagging transaction');
      return false;
    }

    const flaggedData = {
      transactionId: transaction.id,
      transactionDetails: transaction,
      matchedEntity: {
        id: matchedEntity.id,
        name: matchedEntity.name,
        sanctions: matchedEntity.sanctions || [],
        country: matchedEntity.country || 'N/A',
        lastUpdated: matchedEntity.last_updated || 'N/A'
      },
      matchScore,
      timestamp: new Date().toISOString(),
      status: 'PENDING_REVIEW'
    };

    try {
      await this.producer.send({
        topic: this.config.topics.flagged,
        messages: [
          { value: JSON.stringify(flaggedData) }
        ],
      });
      logger.info(`Flagged transaction ${transaction.id} sent to ${this.config.topics.flagged}`);
      
      // Also trigger an alert via the streaming service
      if (this.kafkaStreamingService) {
        await this.kafkaStreamingService.sendAlert(
          'CRITICAL', 
          `Sanctioned entity match: ${matchedEntity.name} in transaction ${transaction.id} (Confidence: ${matchScore}%)`
        );
      }
      
      return true;
    } catch (error) {
      logger.error('Error flagging transaction:', error);
      return false;
    }
  }

  async stop() {
    this.isRunning = false;
    if (this.consumer) {
      await this.consumer.disconnect();
      logger.info('SanctionsMatcher consumer disconnected from Kafka');
    }
    if (this.producer) {
      await this.producer.disconnect();
      logger.info('SanctionsMatcher producer disconnected from Kafka');
    }
  }
}

module.exports = SanctionsMatcher;
