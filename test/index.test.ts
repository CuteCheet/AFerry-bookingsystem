import { describe, it, expect, vi, beforeAll } from 'vitest';
import { handler } from '../src';
import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Buffer } from 'buffer';
import axios from 'axios';
import { PUBLISH_URL } from 'config';

vi.mock('axios')

describe('handler', () => {
  
  // Test case to verify that booking event data is published correctly
  it('should publish booking event data to the specified URL', () => {
    
    // Define a mock Kinesis stream event with booking completed data
    const mockEvent: KinesisStreamEvent = {
      Records: [
        {
          kinesis: {
            data: Buffer.from(
              JSON.stringify({
                type: 'booking_completed',
                booking_completed: {
                  orderId: 123,
                  timestamp: '2024-06-10T12:00:00.000Z',
                  product_provider: 'provider_a',
                },
              })
            ).toString('base64'),
            partitionKey: "c7724b06-813d-410a-adbc-7d19ebff04b2",
            approximateArrivalTimestamp: 1631538059459,
            kinesisSchemaVersion: "1.0",
            sequenceNumber: "c7724b06-813d-410a-adbc-7d19ebff04b2"
          },
          eventSource: "aws:kinesis",
          eventID: "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
          invokeIdentityArn: "arn:aws:iam::EXAMPLE",
          eventVersion: "1.0",
          eventName: "aws:kinesis:record",
          eventSourceARN: "arn:aws:kinesis:EXAMPLE",
          awsRegion: "us-east-1"
        },
      ],
    };

    // Define a mock response object to simulate successful API call
    const mockResponse = { status: 'Success' };
    (axios.post as vi.Mock).mockResolvedValue(mockResponse);

    handler(mockEvent);

    // Assert that axios.post was called with expected parameters
    expect(axios.post).toHaveBeenCalledWith(PUBLISH_URL, {
      product_order_id_buyer: 123,
      timestamp: '2024-06-10T12:00:00.000Z',
      product_provider_buyer: 'provider_a',
    });
  });

  // Test case to ensure event data is not published if the type is not "booking_completed"
  it('should not publish event data if the type is not "booking_completed"', () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [
        {
          kinesis: {
            data: Buffer.from(
              JSON.stringify({
                type: 'booking_requested',
                booking_completed: {
                  orderId: 123,
                  timestamp: '2024-06-10T12:00:00.000Z',
                  product_provider: 'provider_a',
                },
              })
            ).toString('base64'),
            partitionKey: "c7724b06-813d-410a-adbc-7d19ebff04b2",
            approximateArrivalTimestamp: 1631538059459,
            kinesisSchemaVersion: "1.0",
            sequenceNumber: "c7724b06-813d-410a-adbc-7d19ebff04b2"
          },
          eventSource: "aws:kinesis",
          eventID: "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
          invokeIdentityArn: "arn:aws:iam::EXAMPLE",
          eventVersion: "1.0",
          eventName: "aws:kinesis:record",
          eventSourceARN: "arn:aws:kinesis:EXAMPLE",
          awsRegion: "us-east-1"
        },
      ],
    };

    handler(mockEvent);

    expect(axios.post).not.toHaveBeenCalled();
  });
  
});