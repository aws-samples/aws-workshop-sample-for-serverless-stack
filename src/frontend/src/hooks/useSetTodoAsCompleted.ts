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

import axios from 'axios'
import {useMutation, useQueryClient } from 'react-query'
import { BASE_PATH, HEADERS } from '../utils/constants'
import { Todo } from '../utils/Todo'



async function updateTodo(todo: Todo) {
  if(todo.completed)
    todo.completed = false
  else
    todo.completed = true

    const { data } = await axios.put(
        BASE_PATH + "todos/" + todo.id,
        todo, 
        {headers: HEADERS}
    )
    return data
}

export const useSetTodoAsCompleted = () => {
    const queryClient = useQueryClient()
  return useMutation(updateTodo, {
    onMutate: async todo => {
      await queryClient.cancelQueries([['get-todos'], todo.id])
      const previousTodo = queryClient.getQueryData([['get-todos'], todo.id])
      queryClient.setQueryData([['get-todos'], todo.id], todo)
      return { previousTodo, todo }
    },
    onError: (_err, _todo, context: any) => {
        queryClient.setQueryData(
          [['get-todos'], context.todo.id],
          context.previousTodo
        )
    },
    // Always refetch after error or success:
    onSettled: todo => {
      queryClient.invalidateQueries([['get-todos'], todo.id])
    }
  })
}
