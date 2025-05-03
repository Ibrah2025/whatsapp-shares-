/* ───────── admin upload ───────── */
adminUploadBtn.onclick = () => adminFileInput.click();
adminFileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Ensure user is logged in
  if (!auth.currentUser) {
    alert("Please log in first!");
    return;
  }

  // Check admin permission
  if (!ADMIN_UIDS.includes(auth.currentUser.uid)) {
    alert("You don't have permission to upload files.");
    return;
  }

  uploadProgress.classList.remove("hidden");

  try {
    // Create or find existing Ads doc
    let docRef;
    const q = await db.collection("Ads").orderBy("ts", "desc").limit(1).get();
    if (q.empty) {
      // Create a new doc if none found
      docRef = await db.collection("Ads").add({
        desc: "New Product",
        price: "Price TBD",
        status: "available",
        ts: firebase.firestore.FieldValue.serverTimestamp(),
        images: []
      });
      console.log("Created new ad doc:", docRef.id);
    } else {
      docRef = q.docs[0].ref;
    }

    // Upload file to Storage
    const filePath = `products/${Date.now()}_${file.name}`;
    console.log("Uploading to path:", filePath);
    const storageRef = storage.ref(filePath);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log("Upload progress:", percent);
        uploadProgress.textContent = `Uploading: ${percent}%`;
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed: " + error.message);
        uploadProgress.classList.add("hidden");
      },
      async () => {
        // Upload completed
        try {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          console.log("File uploaded, URL:", url);

          // Update doc with new image
          await docRef.update({
            images: firebase.firestore.FieldValue.arrayUnion(url),
            img: url  // optional: set as main image
          });

          alert("Photo uploaded and attached successfully!");
          e.target.value = ""; // reset file input
        } catch (updateError) {
          console.error("Document update error:", updateError);
          alert("Upload succeeded, but couldn't update doc: " + updateError.message);
        } finally {
          uploadProgress.classList.add("hidden");
        }
      }
    );
  } catch (error) {
    console.error("Upload process error:", error);
    alert("Error during upload process: " + error.message);
    uploadProgress.classList.add("hidden");
  }
};
