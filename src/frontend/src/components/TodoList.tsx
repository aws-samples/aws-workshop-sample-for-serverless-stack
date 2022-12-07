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

import { List, ListItem, ListItemText, Checkbox, Divider, IconButton, Box, Typography, CircularProgress } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Todo } from '../utils/Todo';

import {useGetTodos} from '../hooks/useGetTodos';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { useSetTodoAsCompleted } from '../hooks/useSetTodoAsCompleted';

/**
 * Renders a list of TODO entry. Each TODO can be delated or checkmarked as completed 
 * Lifecycle management events should be sent to the parent component (TODO - add some callbacks
 * for this)
 *
 * @param todo The todo to render
 * @returns 
 */


export function TodoList () {
  //Set Todo as Completed
  const{ mutate: setTodoAsCompleted} = useSetTodoAsCompleted() //I could add isLoading and isError

  function handleCompletionUpdate(todo: Todo) {
    setTodoAsCompleted(todo)
  }

  //Delete todo
  const{mutate: deleteTodo} = useDeleteTodo() //I could add isLoading and isError
  function handleDelate(todo: Todo) {
    deleteTodo(todo)
  }

  //Fetch all TODOs
  const onSuccess = () => { console.log('Fetched successfully')}
  const onError = () => { console.log('Failed fetching')}

  const {isLoading, data, isError, error} = useGetTodos(onSuccess, onError)


  while(isLoading)
    return(
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      }}>
      <Typography variant="h6"> Loading...</Typography>
      <CircularProgress sx={{margin: '0.2vmin'}} color="secondary" />
    </Box>
    )

  if(isError)
    return(
      <Box>
        <Typography variant="h6">{error.message}</Typography>
      </Box>)


  return (
    <List dense
      sx={{
        width: '55%',
        bgcolor: 'background.paper',
        boxShadow: '0.3vmin 0.2vmin 1vmin #b0bec5',
        borderRadius: '0.5vmin'
      }}>
        {data?.map((todo: Todo) => {
        return  (
          <Box key={todo.id}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="comments" onClick={() => handleDelate(todo)}>
                  <DeleteOutlineRoundedIcon/>
                </IconButton>
              }
            >
              <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => handleCompletionUpdate(todo)}
                sx={{ marginRight: '2vmin' }}
              />
              {(todo.completed) ?
                <ListItemText primary={`${todo.title}`} sx={{ textDecoration: 'line-through'}} />
                :
                <ListItemText primary={`${todo.title}`} />
              }
            </ListItem>
            <Divider variant="middle" />
          </Box>
        );
      })}
    </List>
  )   
}