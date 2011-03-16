exports.slugifyString = function(str) {
  return str.replace(/\W/g, '-') // Replace all whitespaces to dashes
    .replace(/\-*$/, '') // Trim head dashes
    .replace(/\-*/, '') // Trim tail dashes
    .replace(/\-{2,}/, '-'); // Remove duplicate dashes
}
