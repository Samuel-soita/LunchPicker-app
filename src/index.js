// Base URL for all API requests
const BASE_URL = "http://localhost:3000/posts";

// Runs once when the document is ready
document.addEventListener("DOMContentLoaded", main);

// Initializes app logic: fetches post list, and sets up new post form
function main() {
  displayPosts();
  addNewPostListener();
}

// Fetches all posts from the server and displays them in #post-list
function displayPosts() {
  fetch(BASE_URL)
    .then(response => response.json())
    .then(posts => {
      const postList = document.getElementById("post-list");
      postList.innerHTML = ""; // Clear any previous entries

      // For each post, create a clickable element in the list
      posts.forEach(post => {
        const postItem = document.createElement("div");
        postItem.textContent = post.title;
        postItem.classList.add("post-title");
        postItem.style.cursor = "pointer";
        postItem.addEventListener("click", () => handlePostClick(post.id));
        postList.appendChild(postItem);
      });

      // Automatically show the first post (Advanced deliverable)
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    });
}

// Fetches a single post and displays its full details in #post-detail
function handlePostClick(postId) {
  fetch(`${BASE_URL}/${postId}`)
    .then(response => response.json())
    .then(post => {
      const detail = document.getElementById("post-detail");

      // Render the post information
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;

      // Hook up edit functionality (form is pre-built in HTML)
      document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));

      // Hook up delete button (removes post from API and DOM)
      document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
    });
}

// Adds event listener to new post form to handle submission and POST request
function addNewPostListener() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Collect values from form inputs
    const title = document.getElementById("new-title").value.trim();
    const content = document.getElementById("new-content").value.trim();
    const author = document.getElementById("new-author").value.trim();

    // Create new post object
    const newPost = { title, content, author };

    // Send to server with POST
    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
    .then(res => res.json())
    .then(() => {
      displayPosts(); // Refresh the list with the new post
      form.reset();   // Clear form inputs
    });
  });
}

// Shows and prepares the edit form populated with selected post data
function showEditForm(post) {
  const form = document.getElementById("edit-post-form");
  form.classList.remove("hidden"); // Show form

  // Pre-fill input fields with current post data
  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-content").value = post.content;

  // On form submission, send a PATCH request with the updated data
  form.onsubmit = function (e) {
    e.preventDefault();

    const updatedData = {
      title: document.getElementById("edit-title").value.trim(),
      content: document.getElementById("edit-content").value.trim()
    };

    fetch(`${BASE_URL}/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })
    .then(res => res.json())
    .then(() => {
      form.classList.add("hidden"); // Hide form after update
      displayPosts();               // Refresh list and details
    });
  };

  // Cancel button hides the form without changes
  document.getElementById("cancel-edit").onclick = () => {
    form.classList.add("hidden");
  };
}

// Deletes the selected post from the server and updates the DOM
function deletePost(postId) {
  fetch(`${BASE_URL}/${postId}`, {
    method: "DELETE"
  })
  .then(() => {
    displayPosts(); // Refresh list after deletion
    document.getElementById("post-detail").innerHTML = "<p>Post deleted. Select another post.</p>";
  });
}
