import { KinesisStreamEvent } from 'aws-lambda';

export const handler = (event: KinesisStreamEvent) => {
  console.log(event);
};
