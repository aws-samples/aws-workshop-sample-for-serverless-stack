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

import { useState } from 'react'
import { Card, CardContent, TextField} from '@mui/material'
import { NewTodo, Todo } from '../utils/Todo'
import { useAddTodo } from '../hooks/useAddTodo'

  
export function AddTodo() {
    const [newTodo, setNewTodo] = useState("")
    const{mutate: addTodo} = useAddTodo() //I could add isLoading and isError
    
    function handleChange (event: any) {setNewTodo(event.target.value)}

    function handleKeyDown (event: any) {
        if (event.code !== "Enter")
            return
        
        const todo: NewTodo = {
            title: newTodo,
            completed: false
        }

        addTodo(todo)
        setNewTodo("")
        event.target.value = ""    
    }

    return(
        <Card 
            sx={{
            marginTop: '3vmax',
            width: '50%' 
        }}>
            <CardContent>
                <TextField
                    margin="normal"
                    fullWidth
                    label="New TODO"
                    value={newTodo}
                    onKeyDown={(event) => {handleKeyDown(event)}}
                    onChange={(event) => {handleChange(event)}}
                    autoFocus={true}
                />
                
            </CardContent>
        </Card>
    )
}