import { useState, useEffect } from "react";
import Axios from "axios";
import icon from "./assets/delete.png";
import refreshIcon from "./assets/refresh.png";
import "./App.css";
import ClipLoader from "react-spinners/ClipLoader";


export const Tasks = ({ category, onDeleteCategory, setSessionExpired }) => {
  //__________________________________________________Set up

  const dev = false;
  const basePath = dev ? "http://192.168.1.6:3001/apiroutes" : "/apiroutes";

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load data when mounting
  useEffect(() => {
    setLoading(true)
    Axios.get(`${basePath}/${category.id}/tasks`).then((res) => {
      const tasksArray = res.data;
      setTasks(tasksArray);

      setLoading(false)
      //Add random color to tasks
      tasksArray.map((task) => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let item = document.getElementById(task.id);
        return (item.style.backgroundColor = "#" + randomColor);
      });
      setLoading(false)
    });
    return setTasks([])
  }, [category, basePath, deleting]);

  //__________________________________________________Functions

  const handleTaskChange = (event) => {
    const value = event.currentTarget.value;
    setTaskInput(value);
  };

  const deleteTask = async (taskId) => {
    setDeleting(true)
    if (window.navigator.vibrate) window.navigator.vibrate([100, 30, 100]);

    await Axios.delete(`${basePath}/tasks/${taskId}`)
      .catch((error) => {
        console.log("Access token expired.");
        setDeleting(false)
      })
      .then((response) => {
        if (!response) return setSessionExpired(true);

        setTasks(tasks.filter((item) => item.id !== taskId));
        setDeleting(false)
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
          if (!response) return setSessionExpired(true);

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

  const refresh = () => {
    setLoading(true)
    Axios.get(`${basePath}/${category.id}/tasks`).then((res) => {
      const tasksArray = res.data;
      setTasks(tasksArray);
      setLoading(false)

      //Add random color to tasks
      tasksArray.map((task) => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let item = document.getElementById(task.id);
        return (item.style.backgroundColor = "#" + randomColor);
      });
      setLoading(false)
    })
  }

  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  //__________________________________________________Render

  return (
    <div className="category">
      <div className="catimg">
        <h1 className="categoryName">{category.name}</h1>
        <img
          className="delete"
          src={icon}
          alt="Supprimer catégorie"
          title="Supprimer catégorie"
          onClick={() => onDeleteCategory(category.id)}
        />
        <img
          className="delete"
          src={refreshIcon}
          alt="Actualiser la liste"
          title="Actualiser la liste"
          onClick={refresh}
        />
      </div>
      {loading ?
        <div style={{ margin: "2em 0" }}>
          <ClipLoader css={""} color={"#" + randomColor} loading={loading} size={100} />
        </div>
        : <ul className="taskList">
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
        </ul>}
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
