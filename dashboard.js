document.addEventListener("DOMContentLoaded", function () {
    const BASE_URL = "https://note-backend-954509048139.us-central1.run.app";

    const notesContainer = document.getElementById("notesList");
    const saveButton = document.getElementById("saveNote");
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");

    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    const editTitle = document.getElementById("editTitle");
    const editContent = document.getElementById("editContent");
    const updateButton = document.getElementById("updateNote");
    let editingNoteId = null;

    function decodeJWT(token) {
    const [header, payload] = token.split('.').slice(0, 2);
    const decode = str => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
    return decode(payload);
    }

        const token = localStorage.getItem("accessToken");
    const user = decodeJWT(token);
    console.log("Logged in as userId:", user.userId);

    //  Cek login
    function checkLoginStatus() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Anda belum login!");
            window.location.href = "/index.html";
            return;
        }

        fetch(`${BASE_URL}/notes/id`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Unauthorized");
            }
        })
        .catch(error => {
            alert("Sesi Anda habis. Silakan login kembali.");
            localStorage.removeItem("accessToken");
            window.location.href = "/index.html";
        });
    }

    checkLoginStatus();

    // 📥 Ambil dan tampilkan catatan
    function fetchNotes() {
        const token = localStorage.getItem("accessToken");

        fetch(`${BASE_URL}/notes/id`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Gagal memuat catatan");
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error("Format data tidak sesuai");
            }

            notesContainer.innerHTML = "";
            data.forEach(note => {
                const noteCard = document.createElement("div");
                noteCard.classList.add("card", "mb-3", "text-bg-info", "shadow-lg");
                noteCard.style.maxWidth = "18rem";
                noteCard.style.flex = "1 1 auto";

                noteCard.innerHTML = `
                    <div class="card-header fw-bold d-flex justify-content-between align-items-center">
                        <span>${note.title}</span>
                        <div>
                            <button class="btn btn-warning btn-sm me-1 edit-btn" 
                                data-id="${note.id}" 
                                data-title="${note.title}" 
                                data-content="${note.content}">
                                ✏
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" 
                                data-id="${note.id}">
                                🗑
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="max-height: 150px; overflow-y: auto;">
                        <p class="card-text">${note.content}</p>
                    </div>
                `;
                notesContainer.appendChild(noteCard);
            });

            // Event delete
            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const noteId = this.getAttribute("data-id");
                    deleteNote(noteId);
                });
            });

            // Event edit
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", function () {
                    editingNoteId = this.getAttribute("data-id");
                    editTitle.value = this.getAttribute("data-title");
                    editContent.value = this.getAttribute("data-content");
                    editModal.show();
                });
            });

        })
        .catch(error => {
            console.error("Error fetching notes:", error);
            alert("Gagal memuat catatan.");
        });
    }

    fetchNotes();

    // ➕ Tambah catatan baru
    saveButton.addEventListener("click", function () {
        const title = titleInput.value;
        const content = contentInput.value;

        if (!title || !content) {
            alert("Judul dan isi tidak boleh kosong!");
            return;
        }

        const token = localStorage.getItem("accessToken");

        fetch(`${BASE_URL}/create-notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content }),
            credentials: "include"
        })
        .then(response => response.json())
        .then(() => {
            fetchNotes();
            titleInput.value = "";
            contentInput.value = "";
            bootstrap.Modal.getInstance(document.getElementById("exampleModal")).hide();
        })
        .catch(error => console.error("Error adding note:", error));
    });

    // ✏️ Update catatan
    updateButton.addEventListener("click", function () {
        if (!editingNoteId) return;

        const updatedTitle = editTitle.value;
        const updatedContent = editContent.value;

        if (!updatedTitle || !updatedContent) {
            alert("Judul dan isi tidak boleh kosong!");
            return;
        }

        const token = localStorage.getItem("accessToken");

        fetch(`${BASE_URL}/update-notes/${editingNoteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title: updatedTitle,
                content: updatedContent
            }),
            credentials: "include"
        })
        .then(response => response.json())
        .then(() => {
            fetchNotes();
            editModal.hide();
        })
        .catch(error => console.error("Error updating note:", error));
    });

    // ❌ Hapus catatan
    function deleteNote(id) {
        const token = localStorage.getItem("accessToken");

        fetch(`${BASE_URL}/delete-notes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        })
        .then(response => response.json())
        .then(() => fetchNotes())
        .catch(error => console.error("Error deleting note:", error));
    }
});
