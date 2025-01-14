export async function submitUserDetails(userDetails) {
  const response = await fetch("http://localhost:8000/submit/", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(userDetails)
  });
  return await response.json();
}
