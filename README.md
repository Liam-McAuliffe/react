# Post-Apocalyptic Survival Game (React + Gemini AI)

This project is a base for a post-apocalyptic survival game inspired by "60 Seconds!", where daily events are generated by AI (Gemini). It uses React for the frontend, an Express server for the backend, and Tailwind CSS with Radix UI for styling.

## Project Goals

- Create a survival game experience where players manage resources over generated days.
- Utilize React for dynamic UI updates.
- Integrate Gemini AI via a backend server to generate unique daily scenarios.
- Employ simple figures/visuals due to drawing limitations.

## Current Setup Overview

- **Frontend:** React (v19) with Vite
- **Backend:** Express (v5) server running on `localhost:3001`
- **AI:** Google Gemini API (`@google/genai` library)
- **Styling:** Tailwind CSS (v2 PostCSS 7 compat) and Radix UI (`@radix-ui/react-slot` used in Button)
- **Build Tool:** Vite
- **Linting:** ESLint configured

## First Steps

Here's a suggested path to get started:

1.  **Environment Setup:**

    - Create a file named `.env.local` in the `react-master` root directory.
    - Add your Gemini API key to this file:
      ```
      VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
      ```
    - **Important:** Ensure this file is listed in your `.gitignore` (if you're using Git) to avoid committing your key. The provided `server.js` already uses `dotenv` to load this.

2.  **Backend - Gemini API Route:**

    - You need to implement the logic for the Gemini API call. The `server.js` file expects a handler in `src/api/gemini/route.js`.
    - Create the directory `src/api/gemini/` if it doesn't exist.
    - Create the file `src/api/gemini/route.js`.
    - **Example Implementation (`src/api/gemini/route.js`):**

      ```javascript
      import { GoogleGenerativeAI } from '@google/genai';

      // Ensure the API key is loaded from environment variables
      const genAI = new GoogleGenerativeAI(
        process.env.VITE_GEMINI_API_KEY || ''
      );

      export async function POST(req, res) {
        try {
          // Get game state/prompt context from the request body if needed
          const { promptContext } = req.body; // Example: You might send current resources, day number, etc.

          const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Or your preferred model

          // *** Construct your prompt carefully! ***
          // This prompt tells the AI what kind of event to generate.
          // Include details about the game's tone, current situation, etc.
          const prompt = `
            Generate a short, tense event description for a post-apocalyptic survival game like '60 Seconds!'.
            The player is currently on day ${promptContext?.day || 1}.
            Their current situation: ${
              promptContext?.situation || 'Surviving in a bunker.'
            }
            Focus on resource challenges, survivor interactions, or external threats. Keep it concise (1-3 sentences).
            Example format: "A strange noise echoes from the ventilation shaft. Investigate or ignore?"
            ---
            Generate the event description now:
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          res.status(200).json({ eventDescription: text });
        } catch (error) {
          console.error('Error calling Gemini API:', error);
          // Check for specific API key errors
          if (error.message.includes('API key not valid')) {
            res
              .status(401)
              .json({
                error:
                  'Invalid Gemini API Key. Please check your .env.local file on the server.',
              });
          } else {
            res
              .status(500)
              .json({ error: 'Failed to generate event from Gemini API.' });
          }
        }
      }
      ```

    - Restart your backend server (`node server.js`) after creating/editing this file and `.env.local`.

3.  **Frontend - State Management:**

    - Decide how you'll store the game's state (e.g., day number, food count, water count, survivor health, current event text).
    - For simple cases, start with React's built-in `useState` hook within your main game component.
    - Example state variables:
      ```jsx
      const [day, setDay] = useState(1);
      const [food, setFood] = useState(10);
      const [water, setWater] = useState(10);
      const [eventText, setEventText] = useState('The first day begins...');
      const [isLoading, setIsLoading] = useState(false); // To show loading state
      const [error, setError] = useState(null); // To show errors
      ```

4.  **Frontend - Core Game Component:**

    - Create a new component, e.g., `src/components/game/GameScreen.jsx`.
    - This component will display the current game state (Day, Resources, Event).
    - Add a button (you can use the existing UI button) to "Advance Day".

5.  **Frontend - Fetching Events:**

    - In your `GameScreen.jsx` component, create a function to handle the "Advance Day" button click.
    - This function should:
      - Set `isLoading` to true and clear any previous errors.
      - Make a `Workspace` call to your backend endpoint (`http://localhost:3001/api/gemini`). Use the `POST` method.
      - Send any necessary context in the request body (like the current day number).
      - Handle the response:
        - On success: Update the `eventText` state with the description from the response, increment the `day` state, and potentially update other resources based on game logic (initially, just display the event). Set `isLoading` to false.
        - On error: Set an `error` state to display a message. Set `isLoading` to false.
    - **Example Fetch Function:**

      ```jsx
      const advanceDay = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('http://localhost:3001/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Send context needed for the prompt
              promptContext: {
                day: day,
                situation: `Food: ${food}, Water: ${water}`, // Example context
              },
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          const data = await response.json();
          setEventText(data.eventDescription);
          setDay((prevDay) => prevDay + 1);
          // Add logic here later to modify resources based on eventText
        } catch (e) {
          console.error('Failed to fetch event:', e);
          setError(`Failed to get next day's event: ${e.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      ```

6.  **Frontend - Basic UI:**

    - In `GameScreen.jsx`, render the state variables (`day`, `food`, `water`, `eventText`).
    - Render the "Advance Day" button and attach the `advanceDay` function to its `onClick` event.
    - Display loading indicators or error messages based on the `isLoading` and `error` states.
    - For "simple figures," start with text descriptions and basic shapes using Tailwind CSS classes (e.g., `<div>`, `<p>`). You can add simple SVGs or basic CSS drawings later.

7.  **Routing (Optional):**
    - If you want a start menu, install `react-router-dom` (it's already in your `package.json`).
    - Update `src/main.jsx` or `src/App.jsx` to define routes (e.g., `/` for `Home.jsx`, `/game` for `GameScreen.jsx`).

## Next Steps After Initial Setup

- **Develop Core Game Logic:** Implement how events affect resources and survivor status. Parse the `eventText` or have the AI provide structured data.
- **Add Player Choices:** Modify the AI prompt to sometimes include choices, and implement buttons/actions for the player to react to events.
- **Refine UI:** Improve the visual presentation. Use simple SVGs or CSS for the "simple figures."
- **State Management:** If the game becomes complex, consider using Zustand, Redux Toolkit, or React Context with `useReducer` for more robust state management.
- **Error Handling:** Improve error handling both on the frontend and backend.
