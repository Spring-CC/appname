import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";

export default function Filter() {
  return (
    <div>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Choose Type
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">
            <label>
              <input type="checkbox"></input>
              Japanese
            </label>
          </Dropdown.Item>
          <Dropdown.Item href="#/action-2">
            {" "}
            <label>
              <input type="checkbox"></input>
              Japanese
            </label>
          </Dropdown.Item>
          <Dropdown.Item href="#/action-3"></Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <div className="japanese">
        <label>
          <input type="checkbox"></input>
          Japanese
        </label>
      </div>
      <div className="korean">
        <label>
          <input type="checkbox"></input>
          Korean
        </label>
      </div>
      <div className="american">
        <label>
          <input type="checkbox"></input>
          American
        </label>
      </div>
      <div className="mexican">
        <label>
          <input type="checkbox"></input>
          Mexican
        </label>
      </div>
      <div className="chinese">
        <label>
          <input type="checkbox"></input>
          Chinese
        </label>
      </div>
      <div className="japanese">
        <label>
          <input type="checkbox"></input>
        </label>
      </div>
      <select id="test">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
      </select>
    </div>
  );
}
