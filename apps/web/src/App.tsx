import { useEffect, useState } from "react";
import { User } from "@synergy/types";
import { api } from "./api"; // Tu cliente instanciado

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api
      .getProfile()
      .then((data) => setUser(data)) // 'data' es detectado automáticamente como tipo User
      .catch((err) => console.error(err));
  }, []);

  return user ? <div>Hola, {user.name}</div> : <div>Cargando...</div>;
}
