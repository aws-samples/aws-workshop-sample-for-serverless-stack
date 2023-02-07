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

import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import {DynamoDB} from 'aws-sdk';

// Things we'll need everywhere
const tableName = process.env.TABLE!
const ddbClient = new DynamoDB.DocumentClient()
const defaultUser = 'no-one'
const apiBase = '/api/v1/todos'

const AWS = require('aws-sdk')

// A new TODO submitted by the client
interface NewTodo {
  completed: boolean,
  title: string
}

// Shape of a TODO on the API. This is 
// essentially the original TODO, plus
// the fields that the server side must set.
interface Todo extends NewTodo {
  id: string,
  user_id: string
  created: number
}

// Return a successful JSON response
function success(body: any) { 
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
}

// Returns a failed response
function error(statusCode: number, message: string) {
  return {
    statusCode: statusCode,
    body: JSON.stringify({message: message}),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }}


// Fetches all TODOs for the given user
const getAllTodos = async function(userId: string): Promise<Todo[]> {
  const todoResult = await ddbClient.query({
    TableName: tableName,
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
        ":user_id": userId,
    },    
  }).promise()
  
  if (todoResult.Items) {
    return todoResult.Items as [Todo]
  }
  
  return [] 
}

// Creates a new TODO. Returns the complete TODO, with a UUID added. 
const createTodo = async function(userId: string, todo: Todo): Promise<NewTodo> {

  // Create a copy of the TODO with an UUID
  const newTodo: Todo = {
    ...todo,
    user_id: userId,
    created: new Date().getTime(),
    id: AWS.util.uuid.v4(),
  }

  // Insert the item into the table
  const result = await ddbClient.put({
    TableName: tableName,
    Item: newTodo
  }).promise()
  console.log(result)
  return newTodo
}

// Deletes a TODO
const deleteTodo = async function(userId: string, todoId: string): Promise<boolean> {
  const result = await ddbClient.delete({
    TableName: tableName,
    Key: {
      "user_id": userId,
      "id": todoId
    }
  }).promise()

  return true
}

// Updates a TODO
const updateTodo = async function(todo: Todo): Promise<Todo> { 
  await ddbClient.put({
    TableName: tableName,
    Item: todo
  }).promise()

  return todo
}

  // Get all
  // GET /api/v1/todos 
  export const handleGet: APIGatewayProxyHandlerV2 = async(event) => {
    const allTodos = await getAllTodos(defaultUser)
    return success(allTodos)
  }

  // Create TODO 
  // POST /api/v1/todos
  export const handlePost: APIGatewayProxyHandlerV2 = async(event) => {
    const todo: Todo = JSON.parse(event.body!)
    const createdTodo = await createTodo(defaultUser, todo)
    return success(createdTodo)
  }

  // Delete TODO
  // DELETE /api/v1/todos/{todoId} 
  export const handleDelete: APIGatewayProxyHandlerV2 = async(event) => {
    const todoId = event.pathParameters!.todoId!
    if (await deleteTodo(defaultUser, todoId)) {
      return success({})
    } else {
      return error(400, "Couldn't delete")
    }
  }

  // Update TODO
  // PUT /api/v1/todos/{todoId}
  export const handlePut: APIGatewayProxyHandlerV2 = async(event) => {
    const todoId = event.pathParameters!.todoId!
    const todo : Todo = JSON.parse(event.body!)

    // Sanity check 
    if (todoId !== todo.id) {
      return error(400, "Two different TODO IDs given!")
    }

    const updatedTodo = await updateTodo({
      ...todo,
      user_id: defaultUser 
    })
    return success(updatedTodo)
  }
