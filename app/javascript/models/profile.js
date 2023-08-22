async function fetchProfileCoffees() {
    try {
      const response = await fetch(`/coffees.json`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cafés do perfil:', error);
      return null;
    }
  }
  
  export { fetchProfileCoffees };