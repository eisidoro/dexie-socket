import React, { useEffect, useCallback, useState } from "react";
import { observable } from "rxjs";

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

  const [blockContent, setBlockContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [submiting, setSubmiting] = useState(false);

  const loadFromDatabase = async () => {
    let temp = [];

    setLoading(true);

    await database.table("friends").each((item) => {
      temp.push(item);
    });

    setRegisters([...temp]);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadFromDatabase();
  }, []);

  useEffect(() => {
    const _observer = (change) => {
      if (!change.length) return;

      let [_change] = change;

      // CREATE
      if (_change.type === 1) {
        if (_change.table === 'blocks') {
          database.table('blocks').clear();
          setBlockContent(_change.obj.content)
          return;
        }

        return setRegisters([...registers, { ..._change.obj }]);
      }

      // DELETE
      if (_change.type === 3) {
        let temp = [...registers];
        let index = temp.findIndex((item) => item.oid === _change.key);

        if (index !== -1) {
          temp.splice(index, 1);
          return setRegisters([...temp]);
        }
      }
    };

    database.on("changes", _observer);

    return () => database.on("changes").unsubscribe(_observer);
  }, [registers]);

  async function clearDatabase() {
    await database.table("friends").clear();
    await loadFromDatabase();
  }

  async function handleDelete(register) {
    try {
      await database.table("friends").delete(register.oid);
    } catch (error) {
      console.error("handleDelete", error);
    }
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

  const debounce = (callback, delay) => {
    let timer;

    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  };

  const debounceTextarea = useCallback(
    debounce((text) => {
      database.table("blocks").add({ content: text });
    }, 500),
    []
  );

  async function handleBlockContentChange(e) {
    setBlockContent(e.target.value);
    debounceTextarea(e.target.value);
  }

  if (loading) {
    return (
      <div className="d-flex aling-items-center justify-content-center h-100 w-100">
        <h1>Carregando</h1>
      </div>
    );
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
          disabled={submiting}
        >
          {submiting ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Criando registro</span>
            </div>
          ) : (
            "ENVIAR"
          )}
        </button>
      </form>

      <div className="d-flex mb-4">
        <textarea
          className="form-control"
          value={blockContent}
          onChange={handleBlockContentChange}
        />
      </div>

      <div className="d-flex mb-4 flex-column">
        <p>Outras ações:</p>
        <div>
          <button
            type="button"
            className="btn btn-warning"
            style={{ height: 38 }}
            disabled={submiting}
            onClick={clearDatabase}
          >
            LIMPAR DB
          </button>
        </div>
      </div>

      <h4>Registros</h4>
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
