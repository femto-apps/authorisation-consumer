const config = require('@femto-host/config')
const fetch = require('node-fetch')

/**
 * Client to access authorisation server.
 * 
 * @example <caption>Simple resource authentication</caption>
 * const auth = new Auth({ url: 'http://localhost:9031', key: 'abcd' })
 * await auth.registerStatements([
 *     {
 *         effect: 'allow',
 *         action: 'hoster:GetObject',
 *         resource: 'hoster:object:*'
 *     },
 *     {
 *         effect: 'allow',
 *         action: ['hoster:DeleteObject', 'hoster:UpdateObject'],
 *         resource: 'hoster:object:*',
 *         condition: {
 *             'owns hosted image': { $ensure: 'resource.owner._id == user._id' }
 *         }
 *     }
 * ])
 */
class Auth {
    constructor({ url, key }) {
        this.url = url
        this.key = key
    }

    registerStatement(statement) {
        return fetch(`${this.url}/api/v1/statement`, {
            method: 'POST',
            body: JSON.stringify(statement),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
    }

    registerStatements(statements) {
        return this.registerStatement(statements)
    }

    authorised(resource, user, action) {
        return fetch(`${this.url}/api/v1/authorised`, {
            method: 'POST',
            body: JSON.stringify({ resource, user, action }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
    }
}

;(async () => {
    const auth = new Auth({ url: 'http://localhost:9031', key: 'abcd' })
    await auth.registerStatements([
        {
            effect: 'allow',
            action: 'hoster:GetObject',
            resource: 'hoster:object:*'
        },
        {
            effect: 'allow',
            action: ['hoster:DeleteObject', 'hoster:UpdateObject'],
            resource: 'hoster:object:*',
            condition: {
                'owns hosted image': { $ensure: 'resource.owner._id == user._id' }
            }
        }
    ])
    console.log(await auth.authorised({
        type: 'hoster:object',
        owner: { _id: 'abc' },
        someRecord: true
    }, {
            _id: 'abc'
        }, 'hoster:GetObject'))
})()

module.exports = Auth