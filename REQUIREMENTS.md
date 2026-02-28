# Assignment

# **Functional Requirements**

Develop a frontend application to support creating, getting, and updating leads using Next.js. The application should have the following features:

1. **Public Lead Form**
    
    - A form **PUBLICLY** available for prospects to fill in, with the following required fields:
        
        - First Name
            
        - Last Name
            
        - Email
            
        - Linkedin
            
        - Visas that you’re interested
            
        - Resume / CV (file upload)
            
        - Open long input
            
    - Upon submission, display a confirmation message to the prospect.
        
    - Mock-up (NOTE: the submission should match as close as possible to the mocks)
    
    
2. **Internal Leads List UI**
    
    - An internal UI guarded by authentication to display a list of leads with all the information filled in by the prospect.
        
    - Each lead should have a state that starts as `PENDING` and can be manually transitioned to `REACHED_OUT` by an internal user.
        
    - Include a button to change the state of a lead from `PENDING` to `REACHED_OUT`.
        
    - Mock-up (NOTE: the submission should match as close as possible to the mocks)
        

  

## **Tech Requirements**

- Use Next.js to implement the application.
    
- Mock the API endpoints if necessary (Bonus: implement API routes using Next.js API).
    
- Implement a mock authentication mechanism to protect the internal leads list UI.
    
- Implement file upload for the resume/CV.
    
- Implement form validation to ensure all required fields are filled in correctly.
    
- Style the application using CSS or a CSS-in-JS library (e.g., styled-components).
    
- The submission should match as close as possible to the mocks.