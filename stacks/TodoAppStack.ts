// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as sst from "@serverless-stack/resources";
import { StackContext } from "@serverless-stack/resources";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { SecurityPolicyProtocol } from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess } from "aws-cdk-lib/aws-s3";

export function TodoAppStack({ stack }: StackContext) {
  /**
   * First, we need to create a DynamoDB table to store our TODOs. DynamoDB 
   * needs at least an ID column identified, and optionally also a sort column.
   * Queries that fetch everything by ID are quick - as this drives the partitioning
   * of the data - and we often pick a partition key to reflect our usage patterns.
   * For instance, a User's ID is a good choice, as it lets us quickly fetch all of
   * the data required for a single user's request at once efficiently.
   * 
   * Looking at the API implementation in src/api/lambda.ts, we can see that we 
   * need to include both user_id and id fields in the table schema.
   */
  const table = new sst.Table(stack, "Table", {
    fields: {
      "user_id": "string",
      "id": "string"
    },
    primaryIndex: {
      partitionKey: "user_id",
      sortKey: "id"
    }
  })

  /**
   * Create a HTTP API. For this, we can use `sst.Api`. We need
   * to create routes to cover the TODO index (/api/v1/todos), 
   * as well as the todo-specific operations (/api/v`/todos/{todoId}), 
   * and the HTTP verbs you'd expect on each of these.
   * 
   * For instance, for both the index and individual TODOs, you'd 
   * expect to be able to GET; on the other hand, DELETE makes no
   * sense on the index, only for individual TODOs.
   * 
   * We can also narrow down the permissions for each route - for 
   * instance, get GET routes don't need to be able to write data,
   * so they won't be given permission to do so.
   * 
   * For this to work, we will also need to allow CORS. A wildcard * 
   * is valid for both origin and header.
   * 
   * Finally, at the start of the API implementation in lambda.ts, 
   * we can see that we need to supply a TABLE name in an environment
   * variable so that the function can find the DynamoDB table.
   **/
  const api = new sst.Api(stack, "Api", {   
    accessLog: true,    
    routes: {
      "GET /api/v1/todos": {
        function: {
          handler: "src/api/lambda.handleGet",
          permissions: [table, "grantRead"]
        }
      },
      "POST /api/v1/todos": {
        function: {
          handler: "src/api/lambda.handlePost",
          permissions: [table, "grantPut"]
        }
      },
      "PUT /api/v1/todos/{todoId}": {
        function: {
          handler: "src/api/lambda.handlePut",
          permissions: [table, "grantPut"]
        }
      },
      "DELETE /api/v1/todos/{todoId}": {
        function: {
          handler: "src/api/lambda.handleDelete",
          permissions: [table, "grantDelete"]
        }
      },
    },
    defaults: {
      function: {
        environment: {
          TABLE: table.tableName
        }
      }
    },
    cors: {
      allowMethods: ["ANY"],
      allowOrigins: ["*"],
      allowHeaders: ["*"]

    }
  })

  /**
   * Next we create our frontend. We are using a React app, so we use 
   * the SST construct ReactStaticSite, which gives us a static website 
   * deployment on top of the typical AWS static stack (Cloudfront+S3) 
   * with everything pre-optimized for react.
   * 
   * The site needs to be told how to get to the API, so we also provide
   * a REACT_APP_API_URL, as found in the static website in src/frontend,
   * which points to the API's deployed URL. 
   */
  const frontend = new sst.ReactStaticSite(stack, "Frontend", {
    path: "src/frontend",

    // When we replace the staticish site with a CRA we can
    // use compile-time env substition instead
    environment: {
      "REACT_APP_API_URL": api.url
    },  

    cdk: {
      bucket: {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL
      },
      distribution: {
        minimumProtocolVersion: SecurityPolicyProtocol.SSL_V3,
      }      
    },      
  })
  
  

  /**
   * Challenge 1 - Write TODOs to S3 datalake
   * 
   * Whenever a TODO is created, use the code in the API handler to
   * write the TODO contents to an S3-based datalake. Storing data in low-cost
   * storage like S3 is a common pattern for analytics storage. For this, you'll
   * need to:
   * 
   * - Create an S3 Bucket
   * - Provide the S3 bucket name to the API as an environment variable
   * - Give the API access to write to the bucket
   * - Modify the API implementation to use the S3 API to upload the file. 
   * 
   * You should be able to use SST for all of this. 
   */

  // TODO 

  /**
   * Challenge 2 - Create a CRON job that sends an email if you haven't 
   * completed a TODO within some period of time. You'll need to:
   * 
   * - Add a field to the table capturing when the TODO was created
   * - Add a SST CRON job to periodically scan the table for old TODOs 
   * - Use the lambda behind the CRON job to send a SNS notification for any old items
   * - Subscribe an email address to the SNS notification
   * 
   * For the SNS subscription you will have to use the CDK SNS [1] subscription module,
   * for the rest you should be able to use SST. 
   * 
   * 1. https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_sns_subscriptions-readme.html
   */

  // TODO

  /**
   * Challenge 3 - Add authentication to the API. You can use the SST's Auth construct [1]
   * to get started here, and have the choice of using 3rd party identity providers such as Auth0,
   * or Amazon's own service, Cognito. 
   * 
   * This challenge is harder and requires changes to the frontend app. 
   * 
   * Once you have secured the API, you will need to make use of the Cognito client in the webapp
   * itself to log the user in and obtain credentials which you will then use to call the API gateway.
   * 
   */

  // TODO

  /**
   * Finally, we add some outputs so that we can see the API and
   * frontend endpoints easily when working with the stack. These
   * will be printed to the console. 
   */
  stack.addOutputs({
    "ApiEndpoint": api.url,
    "frontendEndpoint": frontend.distributionDomain
  });


  return {
    
  }
}

