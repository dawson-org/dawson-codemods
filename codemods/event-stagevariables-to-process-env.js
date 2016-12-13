
// Rewrites event.stageVariables as process.env, prepending DAWSON_ to the key
// http://astexplorer.net/#/yWTvXC23lP/1
// e.g.: $ jscodeshift -t event-stagevariables-to-process-env.js --ignore-pattern node_modules apis/*.js


export default function transformer(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
  .find(j.MemberExpression, {
    object: {
      type: 'MemberExpression',
      object: { name: 'event' },
      property: { name: 'stageVariables' }
    }, 
  })
  .forEach(path => {
    j(path).replaceWith(() => {
      let nextValue;
      if (path.value.computed === true) {
        nextValue = j.binaryExpression(
          '+',
          j.literal('DAWSON_'),
          path.value.property
        );
      } else {
        nextValue = j.identifier(`DAWSON_${path.value.property.name}`);
      }
      return j.memberExpression(
        j.memberExpression(
          j.identifier('process'),
          j.identifier('env')),
        nextValue,
        path.value.computed)
    });
  })
  .toSource();
}
