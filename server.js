export default {
    async fetch(request, env) {
      const serpApiKey = "";
  
      // brainwash llama
        let chat = {
        messages: [
          { 
            role: 'system', content: 'You are a lab assistant on a pair of AR glasses. You are to be helpful and remember these documents for reference. You absolutely must under all circumstances fit your response in 75 words'
          }
        ]
      };
      let throwaway = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', chat);
  
      let image;
      let resp; 
      // grab the query from android-studio
      let url = new URL(request.url);
  
      let query = url.searchParams.get("query");
  
      if (query) {
        query = decodeURIComponent(query);
      }
  
      // grab the history items
      let query1 = url.searchParams.get("query1");
  
      if (query1) {
        query1 = decodeURIComponent(query1);
      }
  
      let answer1 = url.searchParams.get("answer1");
  
      if (answer1) {
        answer1 = decodeURIComponent(answer1);
      }
  
      let query2 = url.searchParams.get("query2");
  
      if (query2) {
        query2 = decodeURIComponent(query2);
      }
  
      let answer2 = url.searchParams.get("answer2");
  
      if (answer2) {
        answer2 = decodeURIComponent(answer2);
      }
  
      // image handler
      if (query.includes('Image') || query.includes('image') || query.includes('Picture') || query.includes('picture') || query.includes('Photo') || query.includes('photo'))
      {
          // refine the input to the image search by directing llama
          // let chat = {
          //   messages: [
          //     {role: 'system', content: 'The query given to you will request an image of an object. Please respond with this object only and nothing else.'},
          //     {role: 'user', content: query}
          //   ]
          // };
          // resp = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', chat);
          resp = {"response": ""}; 
  
          const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&engine=google_images&api_key=${serpApiKey}`;
  
          console.log(url);
  
          try {
            const response = await fetch(url);
            if (!response.ok) {
              return new Response(`Error fetching images: ${response.statusText}`, { status: response.status });
            }
        
            const data = await response.json();
            
            image = data.images_results?.[0]?.original || "No image found";
          } catch (error) {
            return new Response(`Fetch error: ${error.message}`, { status: 500 });
          }
      }
      else // otherwise just handle as normal
      {
        // let chat = {
        //   prompt: query, 
        //   max_tokens: 100
        // };
        let chat = {
            messages: [
              {role: 'system', content: "You will receive 1 to 5 inputs, if there is content in the last 4 queries, consider it when answering the first query"},
              {role: 'user', content: query},
              {role: 'user', content: query1},
              {role: 'user', content: answer1},
              {role: 'user', content: query2},
              {role: 'user', content: answer2}
            ]
        };
    
        // sending stuff into deepseek and waiting for response
        resp = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', chat);
  
        image = " ";
      }
    
      let finalResponse = {"text": resp.response, "image": image};
  
      console.log(finalResponse);
  
      // return the deepseek output
      return Response.json(finalResponse);
    }
  };