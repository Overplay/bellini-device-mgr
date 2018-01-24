import _ from 'lodash'

const firstNames = [ 'Albert', 'Bert', 'Chad', 'Dave', 'Evan', 'Frank', 'Harvey', 'Irene', 'Jack', 'Larry' ];
const lastNames = [ 'Adams', 'Bartels', 'Chippin', 'Dippin', 'Engles', 'Fertil', 'Geng', 'Hanks', 'Kahn', 'Liston' ];

export function randomFirstName() {
    return _.sample( firstNames ) + _.random( 0, 9999 );
}

export function randomFullName() {
    return { first: _.sample( firstNames ) + _.random( 0, 9999 ), last: _.sample( lastNames ) };
}