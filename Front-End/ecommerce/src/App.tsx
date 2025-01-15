import Header from "./Components/Header"

function App() {

  const categorias = ["Vestidos", "Roupas", "Sapatos", "Acessórios"];

  return (
    <>
      <Header categories={categorias} />
    </>
  )
}

export default App
