# Recipe Hub app

Recipe Hub is a full-stack web application that enables users to share, discover, comment and rate recipes. Built with Django REST Framework and React TypeScript, it features a robust backend API and an intuitive, responsive frontend interface.

This full-stack project is the final deliverable for the evaluation of trainee Nikolaos Providakis for the Coding Factory Bootcamp of Athens University of Economics and Business (AUEB).

![Recipe Hub Screenshot](screenshots/recipe-hub-main.png)

### Features ###

### User Experience
- Browse recipes with detailed instructions and ingredients
- Share your own recipes with the community
- Rate recipe difficulty to help other users
- Comment on recipes and engage with other users
- Responsive design works on desktop and mobile devices

### Technical Highlights
- JWT-based authentication system
- Rate limiting to prevent abuse
- Efficient database queries with pagination
- Comprehensive test coverage
- Modern, component-based frontend architecture
- Real-time form validation
- Type-safe development with TypeScript

## Project Structure

The project is organized into two main directories:

```
recipe-hub/
├── backend/          # Django REST Framework backend
│   ├── recipes/      # Main application module
│   ├── manage.py     # Django management script
│   └── requirements.txt
│
├── frontend/         # React TypeScript frontend
│   ├── src/         # Source code
│   ├── public/      # Static files
│   └── package.json
│
└── README.md        # This file
```

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/[your-username]/recipe-hub.git
   cd recipe-hub
   ```

2. Follow setup instructions in:
   - [Backend Setup](backend/README.md)
   - [Frontend Setup](frontend/README.md)

## Demo Data

For testing purposes, you can populate the database with sample recipes using:

```bash
# In the backend directory
python manage.py loaddata sample_recipes
```

This will create:
- 12 sample recipes
- Test users (credentials in backend README)
- Sample comments and ratings

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI Components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Django REST Framework](https://www.django-rest-framework.org/) and [React](https://reactjs.org/)
