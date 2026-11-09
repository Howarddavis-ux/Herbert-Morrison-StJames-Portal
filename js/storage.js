const storageKey = 'testUser';

export const storage = {
    get:function(){
        try{
            const json = sessionStorage.getItem(storageKey);
            if (!json) return [];

            const arr = JSON.parse(json);
            return arr;
        }catch (error){
            console.error("Cannot retrieve from storage:", error);
            return []
        }
    },

    store:function(storageKey, value){
        try{
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        }catch{
            console.error("Failed to store:", error);
        }
    }
};