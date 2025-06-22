# Stand-up Randomizer

A modern, dark-themed web application for generating random speaking order for stand-up meetings. Built with vanilla HTML, CSS, and JavaScript with **GitHub API integration** for automatic file updates.

## ✨ Features

- **Add/Remove Participants**: Easily manage your team members list
- **Random Queue Generation**: Generate a fair, random speaking order using Fisher-Yates shuffle algorithm
- **GitHub API Integration**: Automatically updates `participants.json` file in your repository
- **Modern Dark UI**: Beautiful neomorphic design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **No Dependencies**: Pure vanilla JavaScript - no frameworks or libraries required
- **Automatic Commits**: Every change creates a Git commit in your repository

## 🚀 GitHub API Integration

This application automatically syncs with your GitHub repository:

- **Loads participants** from `participants.json` in your repository
- **Saves changes** directly to the repository via GitHub API
- **Creates commits** for every change with descriptive messages
- **Fallback system** downloads updated file if API fails

### Setup Required

Before using the GitHub API features, you need to configure the application:

1. **Create a GitHub Personal Access Token** (see `GITHUB_SETUP.md`)
2. **Update configuration** in `script.js` with your details
3. **Deploy to GitHub Pages**

See `GITHUB_SETUP.md` for detailed setup instructions.

## 🎨 Design

- **Dark Theme**: Modern dark color palette with purple accents
- **Neomorphic Elements**: Soft shadows and depth effects
- **Smooth Animations**: Hover effects and transitions throughout
- **Typography**: Clean Inter font from Google Fonts
- **Two-Column Layout**: Participants list on the left, generated queue on the right

## 🚀 Usage

1. **Add Participants**: Type a name in the input field and click "Add" or press Enter
2. **Remove Participants**: Click the trash icon next to any participant's name
3. **Generate Queue**: Click the "Generate Queue" button to create a random speaking order
4. **Automatic Sync**: All changes are automatically saved to your GitHub repository

## 📁 Project Structure

```
generator/
├── index.html              # Main HTML file
├── style.css               # Dark theme styles with neomorphic effects
├── script.js               # Application logic with GitHub API integration
├── participants.json       # Initial participants list
├── GITHUB_SETUP.md         # GitHub API setup instructions
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: No frameworks or libraries
- **GitHub API**: For automatic file updates
- **Google Fonts**: Inter font family

## 🎯 Key Features

### GitHub API Integration
The app automatically syncs with your GitHub repository:
- Loads initial data from `participants.json`
- Saves all changes via GitHub API
- Creates Git commits for tracking history
- Provides fallback download if API fails

### Random Generation
Uses the Fisher-Yates shuffle algorithm for truly random and fair queue generation.

### Responsive Design
The layout adapts to different screen sizes:
- Desktop: Two-column layout
- Mobile: Single-column stacked layout

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- High contrast colors for readability

## 🌐 Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Fetch API
- CSS custom properties (variables)

## 📱 Mobile Friendly

The application is fully responsive and works great on mobile devices with touch-friendly interface elements.

## 🔧 Configuration

### GitHub API Setup

1. **Create Personal Access Token** in GitHub Settings
2. **Update `script.js`** with your configuration:
   ```javascript
   const GITHUB_CONFIG = {
       token: 'your-token-here',
       owner: 'your-username',
       repo: 'your-repo-name',
       path: 'participants.json',
       branch: 'main'
   };
   ```

### Customization

You can easily customize the appearance by modifying the CSS custom properties in the `:root` selector in `style.css`:

```css
:root {
    --bg-color: #0f1419;
    --primary-color: #6366f1;
    --text-color: #e2e8f0;
    /* ... more variables */
}
```

## 🔒 Security Notes

⚠️ **Important**: The GitHub token is visible in the client-side code. This approach is suitable for:
- Personal projects
- Demo applications
- Non-sensitive data

For production use, consider:
- GitHub Actions with secrets
- Backend API with authentication
- Firebase or other BaaS solutions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Enjoy your organized stand-up meetings with automatic GitHub sync!** 🎉 