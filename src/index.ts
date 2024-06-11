import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Buffer } from 'buffer';
import { PUBLISH_URL } from '../config'
import axios from 'axios';
interface BookingEventData {
    "product_order_id_buyer": number
    "timestamp": string
    "product_provider_buyer": string
}

export const handler = (event: KinesisStreamEvent) => {
  
  event.Records.map(( record: KinesisStreamRecord ) => {

    const decodedData = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
    let jsonData = JSON.parse(decodedData)

    // Checking if the booking is completed
    if ( jsonData.type === "booking_completed" ) {

      // Extracting booking-specific data from the JSON object
      let bookingData = jsonData["booking_completed"]

      //Constructing the booking event data according to the interface
      let bookingEventData : BookingEventData = {
        "product_order_id_buyer" : bookingData.orderId,
        "timestamp": (new Date(bookingData.timestamp)).toISOString(),
        "product_provider_buyer": bookingData.product_provider
      }

      // Publishing the booking event
      axios.post( PUBLISH_URL, bookingEventData )
        .then((response) => {
          console.log('Successfully Published', response.data);
        })
        .catch((error: any) => {
          console.log('Failed to Publish', error)
        })

    }
    
  })

};
