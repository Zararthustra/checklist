import "./App.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import { Tasks } from "./Tasks";

export const App = () => {
  //__________________________________________________Set up

  const dev = false;
  const basePath = dev ? "http://192.168.1.6:3001/apiroutes" : "/apiroutes";

  const [sessionExpired, setSessionExpired] = useState(false)
  const [categories, setCategories] = useState([]);
  const [userObject, setUserObject] = useState({});
  //    Inputs
  const [userName, setUserName] = useState(
    localStorage.getItem("username") !== null
      ? localStorage.getItem("username")
      : ""
  );
  const [password, setPassword] = useState(
    localStorage.getItem("password") !== null
      ? localStorage.getItem("password")
      : ""
  );
  const [newCategory, setNewCategory] = useState("");

  // Set auth header for any type of request
  Axios.defaults.headers.common["authorization"] = userObject.AT;

  // Load data when mounting
  useEffect(() => {
    if (userObject.id) {
      Axios.get(`${basePath}/${userObject.id}/categories`)
        .then((res) => {
          const categoriesArray = res.data;
          setCategories(categoriesArray);
        })
        .catch((error) => console.log("useEffect error."));
    }
  }, [userObject, basePath]);

  //__________________________________________________JWT

  const getNewToken = async () => {
    console.log("Request for a new access token...");

    const response = await Axios.post(`${basePath}/refreshAT`, {
      refreshToken: userObject.RT,
    });

    if (!response) return console.log("Could not get new access token.");

    // Set new AccessToken
    setUserObject({
      ...userObject,
      AT: response.data.accessToken,
    });

    console.log("Access token refreshed successfully.");
    setSessionExpired(false);
  };

  //__________________________________________________Input functions

  const handleUserChange = (event) => {
    const value = event.currentTarget.value;
    setUserName(value);
  };

  const handlePasswordChange = (event) => {
    const value = event.currentTarget.value;
    setPassword(value);
  };

  const handleCategoryInput = (event) => {
    const value = event.currentTarget.value;
    setNewCategory(value);
  };

  //__________________________________________________User functions

  async function addUser(event) {
    event.preventDefault();

    // Check empty fields
    if (userName === "") {
      document.getElementsByClassName("inputName")[0].placeholder =
        "Entrer un Nom";
      return;
    }
    if (password === "") {
      document.getElementsByClassName("inputPassword")[0].placeholder =
        "Entrer un mdp";
      return;
    }

    // API Request
    const response = await Axios.post(`${basePath}/user`, {
      name: userName,
      password: password,
    });

    if (response.data) {
      setUserObject({
        name: response.data.name,
        password: response.data.password,
        id: response.data.id,
        AT: response.data.accessToken,
        RT: response.data.refreshToken,
      });
      localStorage.setItem("username", userName);
      localStorage.setItem("password", password);
    } else {
      document.getElementsByClassName("inputName")[0].placeholder =
        "Existe déjà !";
      document.getElementsByClassName("inputPassword")[0].placeholder = "";
    }

    setPassword("");
    setUserName("");
  }

  const logoutUser = (event) => {
    Axios.post(`${basePath}/user/logout`, {
      refreshToken: userObject.RT,
    });
    setUserObject({});
    localStorage.clear();
  };

  async function logUser(event) {
    event.preventDefault();

    const response = await Axios.post(`${basePath}/user/login`, {
      name: userName,
      password: password,
    });

    if (response.data === "Wrong credentials") {
      document.getElementsByClassName("inputName")[0].placeholder = "Mauvaise";
      document.getElementsByClassName("inputPassword")[0].placeholder =
        "Combinaison";
      setPassword("");
      setUserName("");
    } else {
      setUserObject({
        name: response.data.name,
        id: response.data.id,
        AT: response.data.accessToken,
        RT: response.data.refreshToken,
      });

      localStorage.setItem("username", userName);
      localStorage.setItem("password", password);
    }
  }

  //__________________________________________________Category functions

  async function addCategory(event) {
    event.preventDefault();

    if (newCategory === "") {
      document.getElementsByClassName("inputCategory")[0].placeholder =
        "Entrer une catégorie";
      return;
    }

    await Axios.post(`${basePath}/category`, {
      name: newCategory,
      userId: userObject.id,
    })
      .catch((error) => {
        console.log("Access token expired.");
      })
      .then((response) => {
        if (!response) return setSessionExpired(true);

        setCategories([
          ...categories,
          {
            id: response.data.id,
            name: response.data.name,
          },
        ]);
        document.getElementsByClassName("inputCategory")[0].placeholder = "";
      });

    setNewCategory("");
  }

  async function deleteCategory(categoryId) {
    await Axios.delete(`${basePath}/categories/${categoryId}`)
      .catch((error) => {
        console.log("Access token expired.");
      })
      .then((response) => {
        if (!response) return setSessionExpired(true);
      });

    setCategories(categories.filter((item) => item.id !== categoryId));
  }

  //__________________________________________________Render

  if (sessionExpired) return (
      <div className="refreshSessionWindow">
        <h2 className="connexion">Session expirée</h2>
        <p>Veuillez vous reconnecter</p>
        <div className="login" onClick={getNewToken}>Se reconnecter</div>
      </div>
  )

  if (userObject.AT)
    return (
      <div className="App">
        <button onClick={logoutUser} className="logout">
          Deconnecter
        </button>
        {categories.map((category) => (
          <div key={category.id}>
            <Tasks
              category={category}
              onDeleteCategory={deleteCategory}
              setSessionExpired={setSessionExpired}
            />
          </div>
        ))}
        <form className="form formCategory">
          <input
            className="inputCategory"
            maxLength="20"
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
              maxLength="20"
              placeholder="Nom"
              className="inputName"
              type="text"
              value={userName}
              onChange={handleUserChange}
            ></input>
            <input
              maxLength="20"
              placeholder="Mot de passe"
              className="inputPassword"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            ></input>
          </div>
          <div className="loginDiv">
            <button onClick={logUser} className="login">
              Connecter
            </button>
            <button onClick={addUser} className="register">
              Créer
            </button>
          </div>
        </form>
      </div>
    );
};
