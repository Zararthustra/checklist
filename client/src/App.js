import "./App.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import Tasks from "./Tasks";

const App = () => {
  // Variables
  const dev = true;
  const localHost = dev ? "http://localhost:3001/" : "/";

  const [categories, setCategories] = useState([]);
  const [userObject, setUserObject] = useState({
    name: "",
    password: "",
    id: 0,
  });
  //    Inputs
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Load data when mounting (when userObject change)
  useEffect(() => {
    Axios.get(`${localHost}apiroutes/${userObject.id}/category`).then((res) => {
      const categoriesArray = res.data;
      setCategories(categoriesArray);
    });
  }, [userObject, localHost]);

  //__________________________________________________User functions

  const handleUserChange = (event) => {
    const value = event.currentTarget.value;

    setUserName(value);
  };
  const handlePasswordChange = (event) => {
    const value = event.currentTarget.value;
    setPassword(value);
  };

  async function addUser(event) {
    event.preventDefault();

    if (userName === "") {
      document.getElementsByClassName("inputName")[0].placeholder =
        "Entrer un Nom";
      return;
    }

    if (password === "") {
      document.getElementsByClassName("inputPassword")[0].placeholder = "Entrer un mdp";
      return;
    }

    //Check if user already exists
    const response = await Axios.post(`${localHost}apiroutes/user`, {
      name: userName,
      password: password,
    });
    if (response.data) {
      setUserObject({
        name: response.data.name,
        password: response.data.password,
        id: response.data.id,
      });
    } else {
      document.getElementsByClassName("inputName")[0].placeholder =
        "Existe déjà !";
      document.getElementsByClassName("inputPassword")[0].placeholder = "";
    }
    setPassword("");
    setUserName("");
  }

  const logoutUser = (event) => {
    setUserObject({
      name: "",
      password: "",
      id: 0,
    });
  };

  async function logUser(event) {
    event.preventDefault();

    const response = await Axios.post(`${localHost}apiroutes/user/login`, {
      name: userName,
      password: password,
    });
    if (response.data) {
      setUserObject({
        name: response.data.name,
        password: response.data.password,
        id: response.data.id,
      });
    } else {
      document.getElementsByClassName("inputName")[0].placeholder = "Mauvaise";
      document.getElementsByClassName("inputPassword")[0].placeholder =
        "Combinaison";
    }
    setPassword("");
    setUserName("");
  }

  //__________________________________________________Category functions

  const handleCategoryInput = (event) => {
    const value = event.currentTarget.value;
    setNewCategory(value);
  };

  async function addCategory(event) {
    event.preventDefault();

    if (newCategory === "") {
      document.getElementsByClassName("inputCategory")[0].placeholder =
        "Entrer une catégorie";
    } else {
      const response = await Axios.post(`${localHost}apiroutes/category`, {
        name: newCategory,
        userId: userObject.id,
      });
      setCategories([
        ...categories,
        {
          id: response.data.id,
          name: response.data.name,
        },
      ]);
      setNewCategory("");
      document.getElementsByClassName("inputCategory")[0].placeholder = "";
    }
  }

  async function deleteCategory(categoryId) {
    await Axios.delete(`${localHost}apiroutes/category/${categoryId}`);

    setCategories(categories.filter((item) => item.id !== categoryId));
  }

  // Render
  if (userObject.name !== "")
    return (
      <div className="App">
        <button onClick={logoutUser} className="logout">
          Deconnecter
        </button>
        {categories.map((category) => (
          <div key={category.id}>
            <Tasks category={category} onDeleteCategory={deleteCategory} />
          </div>
        ))}
        <form className="form formCategory">
          <input
            className="inputCategory"
            maxLength="15"
            placeholder=""
            type="text"
            value={newCategory}
            onChange={handleCategoryInput}
          ></input>
          <button className="addCategory" onClick={addCategory}>
            Ajouter une catégorie
          </button>
        </form>
      </div>
    );
  else
    return (
      <div className="logApp">
        <h1 className="connexion">Connexion</h1>
        <form className="logform">
          <div className="inputs">
            <input
              placeholder="Nom"
              className="inputName"
              type="text"
              value={userName}
              onChange={handleUserChange}
            ></input>
            <input
              placeholder="Mot de passe"
              className="inputPassword"
              type="text"
              value={password}
              onChange={handlePasswordChange}
            ></input>
          </div>
          <div className="loginDiv">
            <button onClick={logUser} className="login">
              Connecter
            </button>
          </div>
          <button onClick={addUser} className="register">
            Créer
          </button>
        </form>
      </div>
    );
};

export default App;