import { useState, useEffect } from "react";
import Axios from "axios";
import icon from "./assets/delete.png";
import "./App.css";

const Tasks = ({ category, onDeleteCategory }) => {
  // Variables
  const dev = false;
  const localHost = dev ? "http://localhost:3001/" : "/";

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  // Load data when mounting
  useEffect(() => {
    Axios.get(`${localHost}apiroutes/${category.id}/task`).then((res) => {
      const tasksArray = res.data;
      setTasks(tasksArray);

      //Add random color to tasks
      tasksArray.map((task) => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let item = document.getElementById(task.id);
        return (item.style.backgroundColor = "#" + randomColor);
      });
    });
  }, [category, localHost]);

  // Functions

  const deleteTask = (taskId) => {
    Axios.delete(`${localHost}apiroutes/task/${taskId}`).then(() => {
      setTasks(tasks.filter((item) => item.id !== taskId));
    });
  };

  const handleTaskChange = (event) => {
    const value = event.currentTarget.value;
    setTaskInput(value);
  };

  async function addTask(event) {
    event.preventDefault();

    if (taskInput === "") {
      for (let element of document.getElementsByClassName("inputTask"))
        element.placeholder = "Entrer un élément";
    } else {
      const response = await Axios.post(`${localHost}apiroutes/task`, {
        name: taskInput,
        categoryId: category.id,
      });
      setTasks([
        ...tasks,
        {
          id: response.data.id,
          name: response.data.name,
        },
      ]);

      //Add random color to the tasks
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      let item = document.getElementById(response.data.id);
      item.style.backgroundColor = "#" + randomColor;

      // Reset inputs
      setTaskInput("");
      for (let element of document.getElementsByClassName("inputTask"))
        element.placeholder = "";
    }
  }

  return (
    <div className="category">
      <div className="catimg">
        <h1 className="categoryName">{category.name}</h1>
        <img
          src={icon}
          alt="delete icon"
          onClick={() => onDeleteCategory(category.id)}
        />
      </div>
      <ul className="taskList">
        {tasks.map((task) => (
          <li
            key={task.id}
            id={task.id}
            className="task"
            onClick={() => deleteTask(task.id)}
          >
            {task.name}
          </li>
        ))}
      </ul>
      <form className="form formTask">
        <input
          className="inputTask"
          type="text"
          placeholder=""
          maxLength="20"
          value={taskInput}
          onChange={handleTaskChange}
        ></input>
        <button className="addTask" onClick={addTask}>
          Ajouter à {category.name}
        </button>
      </form>
    </div>
  );
};

export default Tasks;
