import { NextResponse } from 'next/server';
import Property from '../../../models/Property';
import connectToDatabase from '../../../lib/mongodb';

export async function POST(request) {
    try {
        await connectToDatabase();
        
        const { message } = await request.json();
        
        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Parse user message to extract property search criteria
        const searchCriteria = parsePropertyQuery(message.toLowerCase());
        
        if (searchCriteria.isPropertyQuery) {
            // Search for properties based on parsed criteria
            const properties = await searchProperties(searchCriteria);
            
            if (properties.length > 0) {
                const response = formatPropertyResponse(properties, searchCriteria);
                return NextResponse.json({ 
                    response,
                    properties: properties.slice(0, 5), // Limit to 5 properties
                    type: 'property_search'
                });
            } else {
                return NextResponse.json({ 
                    response: `Sorry, I couldn't find any properties matching your criteria${searchCriteria.location ? ` in ${searchCriteria.location}` : ''}${searchCriteria.maxPrice ? ` under ₹${(searchCriteria.maxPrice / 100000).toFixed(0)} lakhs` : ''}. Try adjusting your search criteria or browse our available properties.`,
                    type: 'no_results'
                });
            }
        } else {
            // Handle general queries with predefined responses
            const generalResponse = getGeneralResponse(message.toLowerCase());
            return NextResponse.json({ 
                response: generalResponse,
                type: 'general'
            });
        }
        
    } catch (error) {
        console.error('Chatbot API error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}

function parsePropertyQuery(message) {
    const criteria = {
        isPropertyQuery: false,
        location: null,
        minPrice: null,
        maxPrice: null,
        type: null,
        bhk: null,
        mode: null
    };

    // Check if it's a property-related query
    const propertyKeywords = ['property', 'properties', 'house', 'flat', 'apartment', 'bhk', 'rent', 'buy', 'sell', 'suggest', 'find', 'show', 'search', 'available'];
    criteria.isPropertyQuery = propertyKeywords.some(keyword => message.includes(keyword));

    if (!criteria.isPropertyQuery) {
        return criteria;
    }

    // Parse location
    const locationKeywords = ['in', 'at', 'near', 'around'];
    for (const keyword of locationKeywords) {
        const index = message.indexOf(keyword);
        if (index !== -1) {
            const afterKeyword = message.substring(index + keyword.length).trim();
            const words = afterKeyword.split(' ');
            if (words[0] && words[0].length > 2) {
                criteria.location = words[0];
                break;
            }
        }
    }

    // Parse price - look for patterns like "under 1cr", "below 80 lakhs", "1-2 crore"
    const pricePatterns = [
        /under\s+(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lakhs)/gi,
        /below\s+(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lakhs)/gi,
        /(\d+(?:\.\d+)?)\s*(cr|crore|lakh|lakhs)/gi,
        /(\d+)[-\s](\d+)\s*(cr|crore|lakh|lakhs)/gi
    ];

    for (const pattern of pricePatterns) {
        const match = pattern.exec(message);
        if (match) {
            const amount = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            
            if (unit.includes('cr') || unit.includes('crore')) {
                criteria.maxPrice = amount * 10000000; // Convert crore to rupees
            } else if (unit.includes('lakh')) {
                criteria.maxPrice = amount * 100000; // Convert lakh to rupees
            }
            break;
        }
    }

    // Parse BHK
    const bhkMatch = message.match(/(\d)\s*bhk/i);
    if (bhkMatch) {
        criteria.bhk = `${bhkMatch[1]}bhk`;
    }

    // Parse property type
    if (message.includes('flat') || message.includes('apartment')) {
        criteria.type = 'flat';
    } else if (message.includes('house') || message.includes('villa')) {
        criteria.type = 'house';
    } else if (message.includes('land') || message.includes('plot')) {
        criteria.type = 'land';
    } else if (message.includes('office') || message.includes('commercial')) {
        criteria.type = 'office';
    }

    // Parse mode (buy/rent/sell)
    if (message.includes('rent') || message.includes('rental')) {
        criteria.mode = 'rent';
    } else if (message.includes('buy') || message.includes('purchase')) {
        criteria.mode = 'buy';
    } else if (message.includes('sell')) {
        criteria.mode = 'sell';
    }

    return criteria;
}

async function searchProperties(criteria) {
    const query = {};

    // Add location filter (case-insensitive partial match)
    if (criteria.location) {
        query.location = { $regex: criteria.location, $options: 'i' };
    }

    // Add price filter
    if (criteria.maxPrice) {
        query.price = { $lte: criteria.maxPrice };
    }
    if (criteria.minPrice) {
        if (query.price) {
            query.price.$gte = criteria.minPrice;
        } else {
            query.price = { $gte: criteria.minPrice };
        }
    }

    // Add type filter
    if (criteria.type) {
        query.type = criteria.type;
    }

    // Add BHK filter
    if (criteria.bhk) {
        query.bhk = criteria.bhk;
    }

    // Add mode filter
    if (criteria.mode) {
        query.mode = criteria.mode;
    }

    try {
        const properties = await Property.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        
        return properties;
    } catch (error) {
        console.error('Property search error:', error);
        return [];
    }
}

function formatPropertyResponse(properties, criteria) {
    const count = properties.length;
    const location = criteria.location ? ` in ${criteria.location}` : '';
    const priceRange = criteria.maxPrice ? ` under ₹${(criteria.maxPrice / 100000).toFixed(0)} lakhs` : '';
    const bhk = criteria.bhk ? ` ${criteria.bhk.toUpperCase()}` : '';
    const type = criteria.type ? ` ${criteria.type}` : '';
    const mode = criteria.mode ? ` for ${criteria.mode}` : '';

    let response = `Great! I found ${count} ${type}${bhk} properties${location}${priceRange}${mode}.\n\n`;
    
    properties.slice(0, 3).forEach((property, index) => {
        const price = (property.price / 100000).toFixed(0);
        response += `${index + 1}. ${property.title}\n`;
        response += `   📍 ${property.location}\n`;
        response += `   💰 ₹${price} lakhs\n`;
        response += `   🏠 ${property.bhk ? property.bhk.toUpperCase() : property.type}\n`;
        response += `   📱 ${property.contactNumber}\n\n`;
    });

    if (count > 3) {
        response += `... and ${count - 3} more properties available!\n\n`;
    }

    response += `Would you like to see more details or refine your search criteria?`;
    
    return response;
}

function getGeneralResponse(message) {
    const responses = {
        'hello': "Hello! I'm your A4Realty assistant. I can help you find properties, search by location, price range, and more. Try asking me 'Show me 2BHK in Whitefield under 50 lakhs'!",
        'hi': "Hi there! I can help you search for properties by location, price, and type. What kind of property are you looking for?",
        'help': "I can help you with:\n• Property search by location, price, BHK\n• Find properties for buy/rent\n• Get property details and contact info\n• General real estate guidance\n\nTry: 'Show me 3BHK in Bellandur under 1 crore'",
        'contact': "You can reach our team at:\n• Email: info@a4realty.com\n• Phone: +1 (555) 123-4567\n• Or contact property owners directly through listings!",
        'thank': "You're welcome! Feel free to ask me about any properties you're interested in. I'm here to help you find your dream home!",
    };

    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
        if (message.includes(key)) {
            return response;
        }
    }

    return "I'm here to help you find properties! You can ask me things like:\n• 'Show me 2BHK flats in Koramangala'\n• 'Properties under 80 lakhs'\n• 'Houses for rent in Whitefield'\n\nWhat are you looking for today?";
}