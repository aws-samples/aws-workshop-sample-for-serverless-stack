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
import { useQuery } from 'react-query'
import { BASE_PATH, HEADERS} from '../utils/constants'
import { Todo } from '../utils/Todo'

async function sortData(data: any){
  data.sort((t1:any, t2:any) => (t1.created > t2.created) ? 1 : -1)
}

async function fetchTodos() {
  const { data } = await axios.get(
    BASE_PATH + "todos", 
    {headers: HEADERS}
  )
  await sortData(data)
  return data
}

export const useGetTodos = (onSuccess: any, onError: any) => {
  return useQuery<Todo[], Error>(
    ['get-todos'], 
    fetchTodos,
    {
      onSuccess,
      onError,
      //refetchInterval: 2000: this is for polling
    }
  )
}

