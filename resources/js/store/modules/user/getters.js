export default {
    userId: state => state.user && state.user.id,
    accessToken: state => state.access_token,
    friends: state => state.friends || [],
}
