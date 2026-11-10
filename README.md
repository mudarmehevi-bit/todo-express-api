# RESTful To-Do API

A RESTful To-Do API built using Node.js, Express, and a JSON file for data persistence.

## Endpoints

- `GET /todos` - Fetch all todos
- `GET /todos/:id` - Fetch a single todo by ID
- `POST /todos` - Create a new todo item (JSON body: `{"title": "Sample Task", "completed": false}`)
- `PUT /todos/:id` - Update an existing todo (JSON body: `{"title": "Updated Task", "completed": true}`)
- `DELETE /todos/:id` - Delete a todo by ID