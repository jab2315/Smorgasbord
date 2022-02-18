import fs from 'fs'
import axios from 'axios'
import glob from 'glob'

const MODULES_DIR = "content/modules"



// TODO MAKE ASYNC/AWAIT



function generate_module_data(files, callback) {


  
    var module_data = {};

    const dbb = /\[\[(.*)\]\]/g;


    let filecounter = 0; 
    // we could use promises, or we could do this! hacky but works

    files.forEach(f => {

      var filepath = f.replace(MODULES_DIR + '/', '').replace('.md', '');

      fs.readFile(f, 'utf8', (err, data) => {
        let result = data.matchAll(dbb);
        var double_links = [...result].map(m => { return m[1].trim(); })

        module_data[filepath] = {};
        module_data[filepath].double_links = double_links;

        filecounter++;
        if(filecounter == files.length) { callback(module_data); }

      });
    })


}


/*
 2. parse index.md YAML to generate sequence structure, if exists [TODO/OPTIONAL]
 3. parse filename prefixes to generate sequence structure
 */
function generate_sequence_data(files, callback) {

  const regordinal = /(\d+)-.*/;

  glob(MODULES_DIR + '/*', function(err, sequences) {

    sequences.forEach(s => {

      var seqdata = {};
      var seqpath = s.replace(MODULES_DIR + '/', '')

      if(seqpath.match(regordinal)) {
        seqdata.ordinal = seqpath.match(regordinal)[1];
      } else {
        seqdata.ordinal = -1; // autogenerate ordinals, later TODO
      }

      seqdata.slug = seqpath.split(/\d+-/).pop(0)

      var subfiles = files.filter(f => {
        return f.match(s);
      }).map(f => {
        return f.split('/').pop(0);
      });

      // SUBFILES TO ORDINAL


      console.log("x", s, subfiles)

      console.log(seqdata)

    });
  })

  callback("");

}





var data = {};

glob(MODULES_DIR + '/**/*.md', function(err, files) {

  generate_module_data(files, module_data => {

    data.modules = module_data;

    generate_sequence_data(files, sequence_data => {

      data.sequences = sequence_data;

      console.log(data);

    })


  });
});








/*
 

 I want this to generate:

 {
    sequences: [
        "intro-to-gh": {
            modules: [ ... ],
        },
        "advanced-gis": {
            modules: [ ... ],
        },
    ],
    modules: [
        "getting-started-with-grasshopper": {
            ordinal: 1,
            links_to: ["intro-to-gis-in-grasshopper", "all-about-voronois", ...]
        },
        ...
    ]
}


MODULES
 1. parse all modules for double-brackets

SEQUENCE
 2. parse index.md YAML to generate sequence structure, if exists [TODO/OPTIONAL]
 3. parse filename prefixes to generate sequence structure


*/


/*
axios('https://jsonplaceholder.typicode.com/todos/1').then((response) => {
  fs.writeFile('data/content.json', JSON.stringify(response.data, null, 2), 'utf-8', (err) => {
    if (err) return console.log('An error happened', err)
    console.log('File fetched from {JSON} Placeholder and written locally from MODULD!')
  })
})


*/
