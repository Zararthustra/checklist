import { useState, useEffect } from "react";
import Axios from "axios";
import icon from "./assets/delete.png";
import "./App.css";

export const Tasks = ({ category, onDeleteCategory, onExpiredAT }) => {
  //__________________________________________________Set up

  const dev = false;
  const basePath = dev ? "http://192.168.1.6:3001/apiroutes" : "/";

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  // Load data when mounting
  useEffect(() => {
    Axios.get(`${basePath}/${category.id}/tasks`).then((res) => {
      const tasksArray = res.data;
      setTasks(tasksArray);

      //Add random color to tasks
      tasksArray.map((task) => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let item = document.getElementById(task.id);
        return (item.style.backgroundColor = "#" + randomColor);
      });
    });
  }, [category, basePath]);

  //__________________________________________________Functions

  const handleTaskChange = (event) => {
    const value = event.currentTarget.value;
    setTaskInput(value);
  };

  const deleteTask = async (taskId) => {
    if (window.navigator.vibrate) window.navigator.vibrate([100, 30, 100]);

    await Axios.delete(`${basePath}/tasks/${taskId}`)
      .catch((error) => {
        console.log("Access token expired.");
      })
      .then((response) => {
        if (!response) return onExpiredAT();

        setTasks(tasks.filter((item) => item.id !== taskId));
      });
  };

  async function addTask(event) {
    event.preventDefault();

    if (taskInput === "") {
      for (let element of document.getElementsByClassName("inputTask"))
        element.placeholder = "Entrer un élément";
    } else {
      await Axios.post(`${basePath}/task`, {
        name: taskInput,
        categoryId: category.id,
      })
        .catch((error) => {
          console.log("Access token expired.");
        })
        .then((response) => {
          if (!response) return onExpiredAT();

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
        });

      // Reset inputs
      setTaskInput("");
      for (let element of document.getElementsByClassName("inputTask"))
        element.placeholder = "";
    }
  }

  //__________________________________________________Render

  return (
    <div className="category">
      <div className="catimg">
        <h1 className="categoryName">{category.name}</h1>
        <img
          className="delete"
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
          maxLength="33"
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
