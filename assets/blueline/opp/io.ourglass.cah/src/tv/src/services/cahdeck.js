import Card from './card'
import _ from 'lodash'

export default class CAHDeck{

    /**
     *
     * @param {String} type of deck. `white` or `black`
     * @param {Array<Object>} arrayOfCardJson
     */
    constructor(type, arrayOfCardJson){

        if (! (type==='white' || type==='black')){
            throw new Error('Type must be white or black');
        }

        if (!_.isArray(arrayOfCardJson)){
            throw new Error('I need an array of cards, dipshit');
        }

        let cards = [];
        arrayOfCardJson.forEach((card)=>{
            cards.push( new Card(type, card.text, card.id));
        });

        //shuffle
        this.cards = _.shuffle(cards);

        console.debug(this.cards.length + ' cards of type ' + type + ' added');

    }

    /**
     * Deal a card.
     * @returns {Card}
     */
    draw(){
        return this.cards.pop();
    }




}