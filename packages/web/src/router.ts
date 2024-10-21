// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/error/:slug`
  | `/folder/:slug`
  | `/login`
  | `/page/:slug`
  | `/trash`

export type Params = {
  '/error/:slug': { slug: string }
  '/folder/:slug': { slug: string }
  '/page/:slug': { slug: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
