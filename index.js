import decompress from 'decompress';
import download from 'download';
import execa from 'execa';
import pMapSeries from 'p-map-series';
import tempfile from 'tempfile';

const exec = (cmd, cwd) => pMapSeries(cmd, x => execa.shell(x, {cwd}));

const directory = (dir, cmd) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof dir}\``));
	}

	return exec(cmd, dir);
};

const file = (file, cmd, options) => {
	options = {strip: 1, ...options};

	if (typeof file !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof file}\``));
	}

	const temporary = tempfile();

	return decompress(file, temporary, options).then(() => exec(cmd, temporary));
};

const url = (url, cmd, options) => {
	options = {extract: true,
		strip: 1, ...options};

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof url}\``));
	}

	const temporary = tempfile();

	return download(url, temporary, options).then(() => exec(cmd, temporary));
};

const m = {directory, file, url};
export {directory, file, url};
export default m;
