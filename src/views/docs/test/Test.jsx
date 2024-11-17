import React, { useEffect, useState } from "react";

function Test() {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `https://backend-bhonest-a110b63abc0c.herokuapp.com/docs/test`
        );
        const data = await response.json();

        if (data.success) {
          setDocument(data.document);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        alert("An error occurred while fetching the document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>No document found.</div>;
  }

  // Convert base64 to a data URL for displaying
  const fileUrl = document.fileData
    ? `data:application/pdf;base64,${document.fileData}`
    : null; // Adjust MIME type as necessary

  return (
    <div>
      <h1>{document.title}</h1>
      <p>{document.description}</p>
      {fileUrl ? (
        <iframe
          src={fileUrl}
          title={document.title}
          width="100%"
          height="600px"
          frameBorder="0"
        />
      ) : (
        <p>No document available for preview.</p>
      )}
    </div>
  );
}

export default Test;
