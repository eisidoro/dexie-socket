import React, { useEffect, useState } from "react";

/**
 *
 * @param {Object} param0
 * @param {Dexie.Database} param0.database
 * @returns
 */
function App({ database }) {
  const [registers, setRegisters] = useState([]);

  const [name, setName] = useState("");
  const [shoeSize, setShoeSize] = useState("");

  const [submiting, setSubmiting] = useState(false);

  const [content, setContent] = useState("");

  useEffect(() => {
    async function init() {
      let _registers = [];

      await database.table("friends").each((item) => _registers.push(item));

      setRegisters(_registers);
    }

    init();
  }, []);

  database.on("changes", (change) => {
    if (change.length) {
      if (change[0].table === "blocks") {
        return setContent(change[0].obj.content);
      }

      console.log("change", change);
      let _registers = [...registers];

      _registers.push({ ...change[0].obj });

      setRegisters(_registers);
    }
  });

  async function handleDelete(register) {
    await database.table("friends").delete(register.oid);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (name && shoeSize) {
      try {
        setSubmiting(true);
        await database.table("friends").add({ name, shoeSize });
      } catch (error) {
        console.error("Falha ao gravar no IndexedDB");
      } finally {
        setTimeout(() => {
          setSubmiting(false);
        }, 500);
      }
    }
  }

  async function handleTextAreaChange(e) {
    database.table("blocks").add({ content: e.target.value });
  }

  return (
    <div style={{ padding: 60 }}>
      <form className="mb-4 d-flex align-items-end " onSubmit={handleSubmit}>
        <div className="d-flex">
          <div className="d-flex flex-column">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              required
              className="form-control"
              id="name"
              placeholder="João"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="ms-4 d-flex flex-column">
            <label htmlFor="shoeSize" className="form-label">
              Shoe size
            </label>
            <input
              type="number"
              required
              className="form-control"
              id="shoeSize"
              placeholder="38"
              onChange={(e) => setShoeSize(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="ms-4 btn btn-primary"
          style={{ height: 38 }}
        >
          {submiting ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Criando registro</span>
            </div>
          ) : (
            "CRIAR REGISTRO"
          )}
        </button>
      </form>

      <textarea
        className="form-control"
        value={content}
        onChange={handleTextAreaChange}
      />

      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">OID</th>
            <th scope="col">NAME</th>
            <th scope="col">SHOESIZE</th>
            <th scope="col">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((register, index) => (
            <tr key={register.oid}>
              <th scope="row">{index}</th>
              <td>{register.oid}</td>
              <td>{register.name}</td>
              <td>{register.shoeSize}</td>
              <th>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(register)}
                >
                  Excluir
                </button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
