import { Client,Query,ID,Databases } from "appwrite";

const db_id=import.meta.env.VITE_APPWRITE_DATABASE_ID;
const project_id=import.meta.env.VITE_APPWRITE_PROJECT_ID;
const collection_id=import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client =new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(project_id)

const database=new Databases(client);


export const updateSearchCount=async (searchTerm,movie)=>{
    // check appwrite to see if search already exist in db or not
    try{
        const result=await database.listDocuments(db_id,collection_id,[Query.equal('searchTerm',searchTerm)])

        // if already exist update the count
        if(result.documents.length>0){
            const doc=result.documents[0];
            await database.updateDocument(db_id,collection_id,doc.$id,{count:doc.count+1,
                
            })
            // if it doesn't, create a new document with the search term and count as 1
        }else{
             await database.createDocument(db_id,collection_id,ID.unique(),{
                searchTerm,
                count:1,
                movie_id:movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
             })
        }
    }catch(error){
        console.error(error);
    }


}

export const getTrending=async () =>{
    try{
        const result=await database.listDocuments(db_id,collection_id,[
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents;
    }catch(error){
        console.error(error);
    }
}