const htmlInput = require('joi-html-input');
const Joi = require('joi').extend(htmlInput);

const htmlString = '<div>Test<script>alert(\'test\');</script></div>';
const schema = Joi.htmlInput().allowedTags(['div', 'b']);  // Define allowed tags
const result = schema.validate(htmlString);

console.log(result);  // Expect sanitized output
