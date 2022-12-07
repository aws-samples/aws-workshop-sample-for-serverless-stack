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
import { Aspects } from "aws-cdk-lib";
import { TodoAppStack } from "./TodoAppStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x"
  })

  // This is a workshop demo, and it's nice if everything
  // will get cleaned up when we delete (rather than orphaning databases 
  // and other state stores ). 
  app.setDefaultRemovalPolicy("destroy")

  // Add our todo app stack
  app.stack(TodoAppStack)

  // If we want, we can use CdkNag to lint our solution. This gives us 
  // insight into areas of the setup that may not be best-practice, or may
  // potentially expose security issues. 
  // We leave it disabled by default as some of the default SST constructs 
  // add noise.
  //Aspects.of(app).add(new AwsSolutionsChecks({}))

  
}
