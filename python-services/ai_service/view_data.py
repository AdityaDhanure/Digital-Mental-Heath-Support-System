import pickle
import os

# Define the path to your metadata file
# Make sure this matches the path in your RAGService code
file_path = "./data/metadata.pkl"

def view_pickle_data():
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        print("Run your main application first to generate the default data.")
        return

    try:
        # Open the file in 'read binary' (rb) mode
        with open(file_path, 'rb') as f:
            data = pickle.load(f)
        
        print(f"✅ Successfully loaded {len(data)} documents.\n")
        
        # Print each document clearly
        for i, doc in enumerate(data, 1):
            print(f"--- Document {i} ---")
            print(f"Id:       {doc.get('id', 'N/A')}")
            print(f"Title:    {doc.get('title', 'N/A')}")
            print(f"Type:     {doc.get('type', 'N/A')}")
            print(f"Category: {doc.get('category', 'N/A')}")
            # Printing just the first 100 characters of content to keep it clean
            content_preview = doc.get('content', '')[:100] + "..."
            print(f"Content:  {content_preview}")
            print("")

    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    view_pickle_data()