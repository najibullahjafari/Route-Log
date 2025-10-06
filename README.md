# RouteLog Pro

RouteLog Pro is a robust web application for advanced route logging and management, built with Django for the backend API and React for the dynamic frontend. It leverages TypeScript for type safety and Vite for fast development builds.

The application is available live at [route log pro](http://routelog.kic.codes/) .

## Features

- **Backend (Django)**: RESTful API with Django REST Framework for handling route data, user authentication, and database operations.
- **Frontend (React)**: Interactive UI built with React and TypeScript, optimized for performance using Vite.
- **Integration**: Seamless communication between Django backend and React frontend via API calls.
- **Development Tools**: Hot Module Replacement (HMR) for efficient development, ESLint for code quality.

## Tech Stack

- **Backend**: Django, Django REST Framework, Python
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL (recommended for production)
- **Deployment**: Docker, Nginx (for production setup)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup (Django)

1. Clone the repository:

```bash
git clone https://github.com/najibullahjafari/Route-Log
cd routelog-pro/backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Start the Django server:

```bash
python manage.py runserver
```

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application is available live at [route log pro](http://routelog.kic.codes/) 

## ESLint Configuration

For production applications, update the ESLint config to enable type-aware rules:

```js
// eslint.config.js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      tseslint.configs.recommendedTypeChecked,
      // Or stricter: tseslint.configs.strictTypeChecked
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

For React-specific rules, install and configure `eslint-plugin-react-x` and `eslint-plugin-react-dom`:

```js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
