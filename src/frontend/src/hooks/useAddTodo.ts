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



async function addTodo(todo: Todo) {
    const { data } = await axios.post(
        BASE_PATH + "todos",
        todo, 
        {headers: HEADERS}
    )
    return data
}

export const useAddTodo = () => {
    const queryClient = useQueryClient()
  return useMutation(addTodo, {
    onMutate: async (todo) => {
      await queryClient.cancelQueries(['get-todos'])
      const previousTodos = queryClient.getQueriesData(['get-todos'])
      queryClient.setQueryData(['get-todos'], (oldQueryData: any) => [...oldQueryData, todo])
      
      return previousTodos

    },
    onError: (_err, _todo, context: any) => {
      queryClient.setQueryData(['get-todos'], context.previousTodos)
    },
    onSettled: () => {queryClient.invalidateQueries(['get-todos'])},
  })
}
