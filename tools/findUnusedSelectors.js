const fs = require('fs');
const path = require('path');
const glob = require('glob');

const styles = fs.readFileSync(path.resolve(__dirname, '../resources/css/ceres.css'), {encoding: 'utf-8'});
const exp = /(#|\.)([a-zA-Z][a-zA-Z0-9-_]+)\s*[,{:]/gm;

const classNames = [];
const ids = [];

while ((match = exp.exec(styles)) !== null)
{
    if (match.index === exp.lastIndex) {
        exp.lastIndex++;
    }

    if ( match[1] === '.' && classNames.indexOf(match[2]) < 0 )
    {
        classNames.push( match[2] );
    }
    else if ( match[1] === '#' && ids.indexOf(match[2]) < 0 )
    {
        ids.push( match[2] );
    }
}

const templates = glob.sync(path.resolve(__dirname, '../resources/views/**/*.twig'));
const contents = {};

function findSelectors(list, checkFn)
{
    const result = [];

    list.forEach((selector) => {

        let found = false;
        for( let template of templates )
        {
            if ( !contents.hasOwnProperty(template) )
            {
                contents[template] = fs.readFileSync(template, {encoding: 'utf-8'});
            }

            if (checkFn(selector, contents[template]))
            {
                found = true;
                break;
            }
        }

        if ( !found )
        {
            console.log( selector );
        }
    });

    return result;
}

findSelectors(ids, function(id, markup)
{
    return markup.indexOf('id="' + id + '"') >= 0;
});

findSelectors(classNames, function(className, markup)
{
    return markup.indexOf(className) >= 0;
}); //.forEach(className => console.log('.' + className) );
