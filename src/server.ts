import app from './app';

const PORT = 8000;
app.listen(process.env.PORT || PORT, () => {
	console.log(`Express server listening on port: ${PORT}`);
});