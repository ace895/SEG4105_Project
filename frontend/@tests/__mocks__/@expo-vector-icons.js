module.exports = {
    Ionicons: (props) => {
        const { name, size, color } = props || {}
        // Return a simple element for the icon
        return require('react').createElement('span', { 'data-icon': name, style: { fontSize: size, color } })
    }
}
