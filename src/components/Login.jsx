
import React, { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.reload();
  }, []);

  return (
    <div>
      <h1>Loading</h1>
    </div>
  );
}

